import os
from PyPDF2 import PdfReader
import chromadb
import uuid

# Set up ChromaDB client
PERSIST_DIRECTORY = os.path.join(os.path.dirname(__file__), "vectordb")
client = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
collection = client.get_or_create_collection(name="pdf_embeddings")

def extract_text_from_pdf(pdf_path):
    text = ""
    with open(pdf_path, 'rb') as file:
        pdf_reader = PdfReader(file)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text.strip()

def process_pdfs_in_folder(folder_path, prefix):
    texts = []
    ids = []
    metadatas = []
    print(f"Processing folder: {folder_path}, prefix: {prefix}")
    
    for filename in os.listdir(folder_path):
        print(f"Processing file: {filename}")
        if filename.endswith('.pdf'):
            pdf_path = os.path.join(folder_path, filename)
            try:
                text = extract_text_from_pdf(pdf_path)
                if text:
                    unique_id = f"{prefix}_{str(uuid.uuid4())}"
                    texts.append(text)
                    ids.append(unique_id)
                    metadatas.append({
                        "source": filename,
                        "folder": prefix
                    })
                    print(len(texts))
            except Exception as e:
                print(f"Error processing {filename}: {str(e)}")
    
    return texts, ids, metadatas

def main():
    # Create vectordb directory if it doesn't exist
    if not os.path.exists(PERSIST_DIRECTORY):
        os.makedirs(PERSIST_DIRECTORY)

    # Process PDFs from both folders
    transcript_dir = os.path.join(os.path.dirname(__file__), "transcripts")
    
    # Process ST folder
    st_folder = os.path.join(transcript_dir, "st")
    if os.path.exists(st_folder):
        st_texts, st_ids, st_metadatas = process_pdfs_in_folder(st_folder, "st")
        if st_texts:
            collection.add(
                documents=st_texts,
                ids=st_ids,
                metadatas=st_metadatas
            )
    
    # Process SE folder
    se_folder = os.path.join(transcript_dir, "se")
    if os.path.exists(se_folder):
        se_texts, se_ids, se_metadatas = process_pdfs_in_folder(se_folder, "se")
        if se_texts:
            collection.add(
                documents=se_texts,
                ids=se_ids,
                metadatas=se_metadatas
            )

if __name__ == "__main__":
    main()

