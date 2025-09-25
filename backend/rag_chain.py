from langchain.chains import RetrievalQA
from langchain_ollama import OllamaEmbeddings, OllamaLLM
from langchain_community.vectorstores import Chroma
def get_rag_chain():
    embeddings = OllamaEmbeddings(model="mxbai-embed-large")
    vectorstore = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)

    retriever = vectorstore.as_retriever(search_kwargs={"k": 2})

    llm = OllamaLLM(model="llama3.2:3b")

    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        return_source_documents=True
    )

    return qa_chain
