"""
This script reads .arrow files from a specified directory, extracts the text data,
writes 90% of the dataset to output_train.txt and 10% to output_val.txt,
and builds a vocabulary from the extracted text.
"""

import os
import pyarrow.ipc as ipc
from tqdm import tqdm


def arrow_files_in_dir(directory):
    files = []
    for filename in os.listdir(directory):
        path = os.path.join(directory, filename)
        if filename.endswith(".arrow") and os.path.isfile(path):
            files.append(filename)
    return sorted(files)


folder_path = "/home/zaden/Documents/huggingface/datasets/Skylion007___openwebtext/plain_text/0.0.0/b4325f019c648b1641a1784748667e8b74e5e064"

output_file_train = "output_train.txt"
output_file_val = "output_val.txt"
vocab_file = "vocab.txt"


files = arrow_files_in_dir(folder_path)
total_files = len(files)

# 90% train / 10% validation split
split_index = int(total_files * 0.9)

files_train = files[:split_index]
files_val = files[split_index:]

vocab = set()


# -------------------
# TRAINING DATA
# -------------------

with open(output_file_train, "w", encoding="utf-8") as outfile:

    for filename in tqdm(files_train, total=len(files_train)):

        file_path = os.path.join(folder_path, filename)

        with ipc.open_stream(file_path) as reader:

            for batch in reader:

                texts = batch.column("text").to_pylist()

                for text in texts:
                    outfile.write(text + "\n")
                    vocab.update(text.split())


# -------------------
# VALIDATION DATA
# -------------------

with open(output_file_val, "w", encoding="utf-8") as outfile:

    for filename in tqdm(files_val, total=len(files_val)):

        file_path = os.path.join(folder_path, filename)

        with ipc.open_stream(file_path) as reader:

            for batch in reader:

                texts = batch.column("text").to_pylist()

                for text in texts:
                    outfile.write(text + "\n")
                    vocab.update(text.split())


# -------------------
# WRITE VOCAB
# -------------------

with open(vocab_file, "w", encoding="utf-8") as vf:

    for word in vocab:
        vf.write(word + "\n")