import os
import pyarrow as pa
import pyarrow.ipc as ipc
from tqdm import tqdm


def arrow_files_in_dir(directory):
    files = []
    for filename in os.listdir(directory):
        if filename.endswith(".arrow") and os.path.isfile(os.path.join(directory, filename)):
            files.append(filename)
    return files


folder_path = "/home/zaden/Documents/huggingface/datasets/Skylion007___openwebtext/plain_text/0.0.0/b4325f019c648b1641a1784748667e8b74e5e064"

vocab_file = "vocab.txt"
split_files = int(input("How many files do you want to split the output into? : "))

files = arrow_files_in_dir(folder_path)
print(files)
total_files = len(files)

max_count = total_files // split_files if split_files != 0 else total_files
vocab = set()

for i in range(split_files):
<<<<<<< HEAD

    with open(f"output{i}.txt", "w", encoding="utf-8") as output_file:

=======
    with open(f"ou", "w", encoding="utf-8") as output_file:
>>>>>>> c5ba9827 (vocab file funcrtionality)
        for count, filename in enumerate(tqdm(files[:max_count], total=max_count)):

            file_path = os.path.join(folder_path, filename)

            # OPEN ARROW FILE
            with ipc.open_file(file_path) as reader:
                table = reader.read_all()

            # Convert to python dict
            data = table.to_pydict()

            # Most openwebtext datasets store text in "text"
            texts = data.get("text", [])

            for text in texts:
                output_file.write(text + "\n")

                vocab.update(text.split())

    files = files[max_count:]


with open(vocab_file, "w", encoding="utf-8") as vf:
    for word in vocab:
        vf.write(word + "\n")