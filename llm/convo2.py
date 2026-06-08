import torch
import torch.nn as nn
import torch.nn.functional as F
import pickle

device = "cpu"

# 🔹 SAME model config as training
block_size = 32
n_embd = 256
n_head = 4
n_layer = 4
dropout = 0.2

# 🔹 load vocab
with open("vocab.pkl", "rb") as f:
    string_to_int, int_to_string = pickle.load(f)

UNK = string_to_int.get('<UNK>', 0)

encode = lambda s: [string_to_int.get(c, UNK) for c in s]
decode = lambda l: ''.join([int_to_string[i] for i in l])

vocabulary_size = len(string_to_int)

class GPTLanguageModel(nn.Module):
    def __init__(self, vocab_size):
        super().__init__()
        self.token_embedding_table = nn.Embedding(vocab_size, n_embd)
        self.position_embedding_table = nn.Embedding(block_size, n_embd)
        self.blocks = nn.Sequential(*[
            nn.TransformerEncoderLayer(d_model=n_embd, nhead=n_head)
            for _ in range(n_layer)
        ])
        self.ln_f = nn.LayerNorm(n_embd)
        self.lm_head = nn.Linear(n_embd, vocab_size)

    def forward(self, index):
        B, T = index.shape
        tok = self.token_embedding_table(index)
        pos = self.position_embedding_table(torch.arange(T, device=device))
        x = tok + pos
        x = self.blocks(x)
        x = self.ln_f(x)
        logits = self.lm_head(x)
        return logits

    def generate(self, index, max_new_tokens):
        for _ in range(max_new_tokens):
            idx_cond = index[:, -block_size:]
            logits = self.forward(idx_cond)

            logits = logits[:, -1, :] / 0.8
            probs = F.softmax(logits, dim=-1)

            # top-k
            top_k = 20
            v, ix = torch.topk(probs, top_k)
            probs_filtered = torch.zeros_like(probs)
            probs_filtered.scatter_(1, ix, v)
            probs_filtered = probs_filtered / probs_filtered.sum(dim=-1, keepdim=True)

            next_token = torch.multinomial(probs_filtered, num_samples=1)
            index = torch.cat((index, next_token), dim=1)

        return index


model = GPTLanguageModel(vocabulary_size)
model.load_state_dict(torch.load("model.pt"))
model = model.to(device)
model.eval()

while True:
    prompt = input("You: ")
    if prompt.lower() == "exit":
        break

    prompt = f"User: {prompt}\nAssistant:"
    context = torch.tensor(encode(prompt), dtype=torch.long, device=device).unsqueeze(0)

    output = model.generate(context, 150)[0].tolist()
    text = decode(output)

    print("Bot:", text.split("Assistant:")[-1].strip())