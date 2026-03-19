import torch
import torch.nn as nn
import torch.nn.functional as F
import mmap
import random
import pickle

# device = (
#     "cuda" if torch.cuda.is_available()
#     else "mps" if torch.backends.mps.is_available()
#     else "cpu"
# )

device = "cuda" if torch.cuda.is_available() else "cpu"

print(f'Using device: {device}')

# print(torch.cuda.is_available())
# print(torch.version.hip)

# torch.cuda.get_device_name(0)

block_size = 32 #
batch_size = 64 #
max_iterations = 1000 #
learning_rate = 3e-4 #
evaluate_iterations = 250 #
n_embd = 384
n_head = 8
n_layer = 8
dropout = 0.2


chars = ""
with open("wizard_of_oz.txt", 'r', encoding='utf-8') as f:
    text = f.read()
chars =  sorted(set(text)) + ['<UNK>']

vocabulary_size = len(chars)

# print(chars)


string_to_int = {ch:i for i,ch in enumerate(chars)}
int_to_string = {i:ch for i,ch in enumerate(chars)}

UNK = string_to_int['<UNK>']



encode = lambda s: [string_to_int.get(c, UNK) for c in s]
decode = lambda l: ''.join([int_to_string[i] for i in l])

# data = torch.tensor(encode(text), dtype=torch.long)
# print(data[:100])


# split the data into train and validation sets
# n=int(0.8*len(data)) #0.8
# train_data = data[:n]
# val_data = data[n:]

def get_random_chunk(split):

    filename = "train_split.txt" if split == 'train' else "val_split.txt"

    with open(filename, "rb") as file:
        with mmap.mmap(file.fileno(), 0, access=mmap.ACCESS_READ) as mm:
            file_size = len(mm) #mm.size()
            start_pos = random.randint(0, (file_size)- block_size*batch_size)

            mm.seek(start_pos)
            block = mm.read(block_size*batch_size-1)

            decode_block = block.decode('utf-8', errors='ignore').replace("\r", "")

            data = torch.tensor(encode(decode_block), dtype=torch.long)
    
    return data


# function to generate a batch of data
def get_batch(split):
    data = get_random_chunk(split)
    ix = torch.randint(len(data) - block_size, (batch_size,))
    # print(ix)
    x = torch.stack([data[i:i+block_size] for i in ix])
    y = torch.stack([data[i+1:i+block_size+1] for i in ix])
    x,y = x.to(device), y.to(device)
    return x, y

# x,y = get_batch('train')
# print('inputs:')
# print(x.shape)
# print(x)
# print('targets:')
# print(y.shape)
# print(y)

'''
https://www.youtube.com/watch?v=BTVUPhpXUd4&list=PLOZ8y37SEZTbf_57K1I4g7Jjrr6raTxbk&index=5
https://www.youtube.com/watch?v=Ip6NkFQ5DKw
https://www.youtube.com/watch?v=2FYzX2eW_aw

'''


class Head(nn.Module):
    '''one head of self-attention'''

    def __init__(self, head_size):
        super().__init__()
        self.key = nn.Linear(n_embd, head_size, bias=False)
        self.query = nn.Linear(n_embd, head_size, bias=False)
        self.value = nn.Linear(n_embd, head_size, bias=False)
        self.register_buffer('tril', torch.tril(torch.ones(block_size, block_size))) # lower triangular matrix
        
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        B,T,C = x.shape
        k = self.key(x)   # (B,T,C)
        q = self.query(x) # (B,T,C)
        # compute attention scores ("affinities")
        wei = q @ k.transpose(-2,-1) * k.shape[-1] **-0.5 # (B, T, C) @ (B, C, T) -> (B, T, T)
        wei = wei.masked_fill(self.tril[:T,:T] == 0, float('-inf')) # (B, T, T)
        wei = F.softmax(wei, dim=-1) # (B, T, T)
        wei = self.dropout(wei)
        # perform the weighted aggregation of the values
        v = self.value(x) # (B,T,C)
        out = wei @ v # (B, T, T) @ (B, T, C) -> (B, T, C)
        return out

class MultiHeadAttention(nn.Module):
    def __init__(self, num_heads, head_size):
        super().__init__()
        self.heads = nn.ModuleList([Head(head_size) for _ in range(num_heads)])
        self.proj = nn.Linear(head_size * num_heads, n_embd)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        out = torch.cat([h(x) for h in self.heads], dim=-1)
        out = self.dropout(self.proj(out))
        return out 

class FeedForward(nn.Module):
    ''' a simple linear layer followed by a non-linearity '''

    def __init__(self, n_embd):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(n_embd, 4 * n_embd),
            nn.ReLU(),
            nn.Linear(4 * n_embd, n_embd),
            nn.Dropout(dropout)
        )
    
    def forward(self, x):
        return self.net(x)

class Block(nn.Module):

    ''' transformer block communication follwed by computation '''

    def __init__(self, n_embd, n_head):
        super().__init__()

        head_size = n_embd // n_head
        self.sa = MultiHeadAttention(n_head, head_size)
        self.ffwd = FeedForward(n_embd)
        self.lnl = nn.LayerNorm(n_embd)
        self.ln2 = nn.LayerNorm(n_embd)
    
    def forward(self, x):
        y = self.sa(x)
        x = self.lnl(x + y)
        y = self.ffwd(x)
        x = self.ln2(x+y)
        return x
    


class GPTLanguageModel(nn.Module):
    def __init__(self, vocab_size):
        super().__init__()
        self.token_embedding_table = nn.Embedding(vocab_size, n_embd)
        self.position_embedding_table = nn.Embedding(block_size, n_embd)
        self.blocks = nn.Sequential(*[Block(n_embd, n_head) for _ in range(n_layer)])

        self.ln_f = nn.LayerNorm(n_embd)
        self.lm_head = nn.Linear(n_embd, vocab_size)

        self.apply(self._init_weights)

    def _init_weights(self, module):
        if isinstance(module, nn.Linear):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                torch.nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)

    def forward(self, index, targets=None):

        B, T = index.shape

        # logits = self.token_embedding_table(index)  # (B,T,C)

        token_embeddings = self.token_embedding_table(index)  # (B,T,C)
        position_embeddings = self.position_embedding_table(torch.arange(T, device = device))
        x = token_embeddings + position_embeddings
        x = self.blocks(x)
        x = self.ln_f(x)
        logits = self.lm_head(x)


        if targets is None:
            loss = None
        else:
            B, T, C = logits.shape
            logits = logits.view(B*T, C)
            targets = targets.view(B*T)
            loss = F.cross_entropy(logits, targets)
        return logits, loss
    
    def generate(self, index, max_new_tokens):
        for _ in range(max_new_tokens):
            index_cond = index[:, -block_size:] # crop context to the last block_size tokens
            logits, loss = self.forward(index)
            logits = logits[:, -1, :] / 0.8
            probs = F.softmax(logits, dim=-1)
            index_next = torch.multinomial(probs, num_samples=1)
            index = torch.cat((index, index_cond), dim=1)
        return index

model = GPTLanguageModel(vocabulary_size)
m = model.to(device)
print(f"Model parameters: {sum(p.numel() for p in m.parameters()):,}")

# context = torch.zeros((1,1), dtype=torch.long, device=device)
# generated_chars = decode(m.generate(context, max_new_tokens=500)[0].tolist())
# print(generated_chars)

# with open("model-o1.pkl", "rb") as f:
#     model = pickle.load(f)
# m = model.to(device)





@torch.no_grad()
def estimate_loss():
    out = {}
    model.eval()
    for split in ['train', 'val']:
        losses = torch.zeros(evaluate_iterations)
        for k in range(evaluate_iterations):
            X, Y = get_batch(split)
            logits, loss = model(X, Y)
            losses[k] = loss.item()
        out[split] = losses.mean()
    model.train()
    return out




optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate)

for iter in range(max_iterations):
    if iter % evaluate_iterations == 0:
        losses = estimate_loss()
        print(f"step {iter}: train loss {losses['train']:.4f}, val loss {losses['val']:.4f}")
    
    xb, yb = get_batch('train')
    logits, loss = model.forward(xb, yb)
    optimizer.zero_grad(set_to_none=True)
    loss.backward()
    optimizer.step()
print(loss.item())


with open("model-o1.pkl", "wb") as f:
    pickle.dump(model, f)
print("Model saved to model-o1.pkl")
