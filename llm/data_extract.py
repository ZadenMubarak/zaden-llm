import os
import lzma
from tqdm import tqdm # pyright: ignore[reportMissingModuleSource]


def arrow_files_in_dir(directory):
    files = []
    for filename in os.listdir(directory):
        if filename.endswith('.arrow') or filename.endswith('.arrow.lzma') and os.path.isfile(os.path.join(directory, filename)):
            files.append(filename)
    return files

folder_path = "/home/zaden/Documents/huggingface/datasets/Skylion007___openwebtext/plain_text/0.0.0/b4325f019c648b1641a1784748667e8b74e5e064"
output_file = "output{}.txt"
vocab_file = "vocab.txt"
split_files = int(input("How many files do you want to split the output into? : "))

files = arrow_files_in_dir(folder_path)

total_files = len(files)