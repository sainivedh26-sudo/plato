<!-- <img width="638" height="139" alt="shapes at 26-08-14 22 57 52" src="https://github.com/user-attachments/assets/f468e7dd-d2ac-432a-be67-e95fda4b5760" /> -->

<p align="center">
<img src="plato_logo.png" width="400"/>
</p>

<br>

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![boto3](https://img.shields.io/badge/boto3-FF9900?logo=aws&logoColor=fff)
![Nginx](https://img.shields.io/badge/nginx-009639?logo=nginx&logoColor=fff)
![AWS Bedrock](<https://img.shields.io/badge/AWS%20Bedrock-FF9900?logo=aws&logoColor=fff>) ![Hugging Face](<https://img.shields.io/badge/Hugging%20Face-FFD21E?logo=huggingface&logoColor=000>)
![made-with-python](<https://img.shields.io/badge/Made%20with-Python3-brightgreen>)
![Pingram](https://img.shields.io/badge/Pingram-000000?style=for-the-badge)
![LangGraph](https://img.shields.io/badge/LangGraph-1C3C3C?style=for-the-badge)
![AWS SSM](<https://img.shields.io/badge/AWS%20SSM-FF9900?style=for-the-badge&logo=amazonaws&logoColor=fff>)
![CockroachDB](https://img.shields.io/badge/CockroachDB-6933FF?style=for-the-badge&logo=cockroachlabs&logoColor=fff)
![Google Meet](<https://img.shields.io/badge/Google%20Meet-00897B?style=for-the-badge&logo=googlemeet&logoColor=fff>)
![Read AI](<https://img.shields.io/badge/Read%20AI-000000?style=for-the-badge>)

<br>
<br>
<br>

<h1 align="center">
  <font size="7">Plato </font>
</h1>
  <p align="center">
    An Forward Deployed Engineer (FDE) agent that can connect with customer's production environment in real time. it can reason and debug the issue raised by customer. it can connect with google meet and interact with customer to exactly debug the issue
    <br />
    </p>
</p>

<br>
<br>

## Want a quick hands on ?

<br>

[![w1](https://github.com/user-attachments/assets/e449d585-6156-4b3b-8867-81849678defd)](https://plato-topaz.vercel.app/)
<br>

## End-to-End Demonstration

<br>

[![w2](https://github.com/user-attachments/assets/4eefe3bb-34e0-4f16-aa4b-6dc944e67a8f)](https://www.loom.com/share/ce5512c7d0f348ef88dec622fcf5dc74)

<br>

## Architecture (for humans - visually good version)

<br>

<img width="2441" height="1071" alt="shapes at 26-08-07 02 18 49 (1)" src="https://github.com/user-attachments/assets/6e903b61-59cb-4275-8802-6161dc372edd" />

<br>

## Architecture (for AI Agents)


```mermaid
flowchart LR

    %% =====================
    %% Ticket Ingestion
    %% =====================

    Gmail["📧 Gmail"]
    Pingram["Pingram"]
    Agent["🐍 Python Agent"]

    Gmail -. "Ticket from customer" .-> Pingram
    Pingram -. "Webhook payload" .-> Agent


    %% =====================
    %% Data / Context
    %% =====================

    CockroachDB["🪳 CockroachDB"]
    LangGraph["🟢 LangGraph"]

    Agent -.-> CockroachDB
    Agent -.-> LangGraph


    %% =====================
    %% Agent Execution
    %% =====================

    subgraph Execution["Agent Execution Environment"]

        SubAgent["Sub-agent"]

        Gemini["✦ Gemini Live"]
        Plan["Plan & Reason"]
        Qwen["🧠 Qwen3-Coder<br/>Inference via AWS Bedrock"]

        Gemini -.-> SubAgent
        Plan -.-> SubAgent
        Qwen -.-> SubAgent

    end

    LangGraph -.-> SubAgent


    %% =====================
    %% AWS / Tool Access
    %% =====================

    AWS["☁️ AWS SCM"]
    CustomerEnv["🖥️ Customer Environment"]

    Agent -.-> AWS
    SubAgent -. "tool" .-> AWS
    AWS -. "Secured access to customer's environment" .-> CustomerEnv


    %% =====================
    %% Meeting / User
    %% =====================

    ReadAI["🔵 Read AI"]
    GoogleMeet["📹 Google Meet"]
    User["👤 User"]

    SubAgent -.-> ReadAI
    ReadAI -.-> GoogleMeet
    GoogleMeet -.-> User
```



## Core Features

### > Live Customer Session Workspace

One shared interface for the entire support interaction — customer conversation, worker-agent activity, environment status, and audit trail, all visible in real time.

### > Dual-Agent Architecture

A conversation agent (Gemini Live) manages natural dialogue with the customer, while a separate worker agent (Groq-based, LangChain/LangGraph) handles technical investigation, tool planning, and debugging — keeping conversation and execution cleanly separated.

### > Tenant-Scoped Memory

Every customer is uniquely identified and mapped to their own history. The agent recalls prior sessions, previously attempted fixes, and past outcomes before starting a new investigation — powered by CockroachDB's distributed SQL and vector search.

### > Dynamic, Task-Scoped Tool Access

Tools available to the agent are generated per task, not fixed globally. Destructive or high-impact actions are restricted by default and require explicit approval.

### > Human-in-the-Loop Approval

Before any disruptive or irreversible action, the agent explains the action, its impact, and rollback options in plain language, and waits for explicit confirmation.

### > Time-Boxed, Auditable Access

Diagnostic sessions run against isolated sandbox environments with scoped, temporary access. Every command, approval, and result is logged for full auditability, and access is automatically revoked when the session ends.

### > Full Observability

Every conversation turn, tool call, planning step, and agent handoff is traced end-to-end via LangSmith, giving complete visibility into how each issue was investigated and resolved.

### > Cross-Session Pattern Detection

Semantic search over past incidents (via CockroachDB vector indexing) surfaces recurring issues across customers, helping teams spot systemic problems rather than treating every ticket as isolated.

### > Enterprise Admin Dashboard

Real-time visibility into active agent sessions, which customers are being served, common issues raised over time, and resolution outcomes — built for admin/ops oversight, not just end users.

<br>
<br>

---


---

![Material wave loading](https://github.com/user-attachments/assets/a08255eb-9647-471d-9881-61871332249f)

### Developed with ❤️ by [Sai Nivedh](https://github.com/sainivedh26-sudo)
