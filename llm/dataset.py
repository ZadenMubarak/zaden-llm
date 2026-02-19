from datasets import load_dataset

ds = load_dataset("Skylion007/openwebtext", streaming=True, split="train")

print(ds)

def load_data(dataset_name, split):
    """
    Load a dataset using the Hugging Face Datasets library.

    Args:
        dataset_name (str): The name of the dataset to load.
        split (str): The split of the dataset to load (e.g., 'train', 'test', 'validation').

    Returns:
        Dataset: A Hugging Face Dataset object containing the specified split of the dataset.
    """
    return load_dataset(dataset_name, split=split)