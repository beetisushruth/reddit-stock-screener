
# 🧠 Reddit DD Monitor – Serverless AI Filtering Pipeline

A lightweight, serverless pipeline that scrapes Reddit posts from r/WallStreetBets, filters for "Due Diligence (DD)" posts, sends them to an LLM for quality evaluation, and triggers a notification if they pass a threshold. Built using AWS Lambda, Amazon Bedrock (or any LLM), and optional S3 + SNS/SES.

---

## 📌 Features

- 🔄 Periodic Reddit scraping via AWS Lambda
- 🧠 Smart filtering with LLMs (e.g., Claude via Amazon Bedrock)
- ☁️ Optional archival to Amazon S3
- 📢 Notification via SNS, SES, or Slack
- 💰 Designed to stay within AWS Free Tier for light usage

---

## 🛠 Architecture Overview

1. **EventBridge** triggers the Lambda every X minutes
2. **Lambda**:
    - Fetches Reddit posts
    - Filters for potential DD posts
    - Evaluates with LLM
    - Sends notification if score exceeds threshold
    - Optionally archives post to S3

---

## 🧩 Tech Stack

- AWS Lambda (Python or Java)
- Amazon EventBridge (scheduler)
- Amazon Bedrock (LLM)
- Amazon S3 (optional storage)
- Amazon SNS or SES (notifications)
- IAM Roles for scoped access

---

## 🔐 Required IAM Permissions

```json
[
  "logs:*",
  "bedrock:InvokeModel",
  "s3:PutObject",
  "s3:GetObject",
  "sns:Publish",
  "ses:SendEmail"
]
```

---

## 🚀 Deployment Steps

1. **Create IAM Role** with necessary permissions
2. **Deploy Lambda Function** (Python or Java)
3. **Configure EventBridge Rule** to trigger Lambda periodically
4. **Set environment variables**:
   
---

## 📤 Sample LLM Prompt

> "Rate the following DD post on a scale from 0–10 for insight, credibility, and relevance. Respond with JSON: {"quality_score": <score>, "summary": "<summary>"}"

---

## 📈 Cost Estimation

| Service       | Estimated Cost (per month) |
|---------------|-----------------------------|
| Lambda        | ~$0.00–$0.30                |
| S3 Storage    | ~$0.01–$0.05                |
| Amazon Bedrock| ~$0.75 (Claude Instant)     |
| SNS/SES       | Free – <$0.10               |
| **Total**     | **~$1–$6/month**            |

---

## 📎 License

MIT License – feel free to use, modify, and share with attribution.

---

## ✨ Future Improvements

- Support for multiple subreddits
- Store LLM evaluations in DynamoDB
- Webhook integration for Slack/Discord alerts
- Step Functions to handle post-processing logic

---

## 🤝 Contributions

PRs and feedback are welcome. Fork the repo and build your own Reddit post intelligence engine!
