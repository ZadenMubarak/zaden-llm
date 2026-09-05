import torch
import torch.nn as nn
import torch.nn.functional as F
import mmap
import random
import pickle
import re

# device = "cuda" if torch.cuda.is_available() else "cpu"
device = "cpu"

print(f'{"\033[92m"}Loading please wait...')

# block_size = 32 #
# batch_size = 64 #
# max_iterations = 10000 #
# learning_rate = 3e-4 #
# evaluate_iterations = 250 #
# n_embd = 384
# n_head = 8
# n_layer = 8
# dropout = 0.2

block_size = 316 #
batch_size = 32 #
max_iterations = 10000 #
learning_rate = 3e-4 #
evaluate_iterations = 250 #
n_embd = 254
n_head = 4
n_layer = 4
dropout = 0.2

chars = set()

for file in ["vocab.txt"]:
    with open(file, "r", encoding="utf-8") as f:
        chars.update(f.read())

chars = sorted(list(chars)) + ['<UNK>']

vocabulary_size = len(chars)

string_to_int = {ch:i for i,ch in enumerate(chars)}
int_to_string = {i:ch for i,ch in enumerate(chars)}

UNK = string_to_int['<UNK>']

encode = lambda s: [string_to_int.get(c, UNK) for c in s]
decode = lambda l: ''.join([int_to_string[i] for i in l])


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

            index_cond = index[:, -block_size:]  # keep context window

            logits, _ = self.forward(index_cond)

            logits = logits[:, -1, :] / 1.0
            probs = F.softmax(logits, dim=-1)

            index_next = torch.multinomial(probs, num_samples=1)

            index = torch.cat((index, index_next), dim=1)

        return index

model = GPTLanguageModel(vocabulary_size)



m = model.to(device)


model = GPTLanguageModel(vocabulary_size)
model.load_state_dict(torch.load("model.pt"))
model = model.to(device)
model.eval()

with open("vocab.pkl", "rb") as f:
    string_to_int, int_to_string = pickle.load(f)

encode = lambda s: [string_to_int.get(c, UNK) for c in s]

decode = lambda l: ''.join([int_to_string[i] for i in l]).replace('<UNK>', ' ')

conversation = ""

while True:
    user_input = input("You: ")
    if user_input.lower() == "exit":
        break

    conversation += f"User: {user_input}\nAssistant:"

    context = torch.tensor(encode(conversation), dtype=torch.long, device=device).unsqueeze(0)

    output = model.generate(context, max_new_tokens=250)[0].tolist()
    decoded = decode(output)

    reply = decoded.split("Assistant:")[-1].strip()

    print("Bot:", reply)

    conversation += reply + "\n"

# while True:
#     prompt = input("You: ")
#     if prompt.lower() == "exit":
#         break

#     prompt = f"User: {prompt}\nAssistant:"

#     context = torch.tensor(encode(prompt), dtype=torch.long, device=device).unsqueeze(0)

#     output = model.generate(context, max_new_tokens=150)[0].tolist()
#     decoded = decode(output)

#     if "Assistant:" in decoded:
#         print("Bot:", decoded.split("Assistant:")[-1].strip())
#     else:
#         print("Bot:", decoded)