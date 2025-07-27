
# 🧩 Tech Plan: Single Lambda for Scraping, LLM Evaluation, and Notification

## 🎯 Goal

Use one AWS Lambda function that:

1. Scrapes Reddit for new posts.
2. Identifies “DD” posts.
3. Sends DD content to an LLM for evaluation (e.g., Amazon Bedrock).
4. If quality criteria are met, sends a notification (e.g., via email or Slack).
5. Optionally stores raw posts in S3 for logging/auditing.

---

## 🔧 Components

### 1. Lambda Function: `ScraperAndProcessorLambda`

**Trigger**:  
- Amazon EventBridge (e.g., every 15 mins)

**Responsibilities**:
- Connect to Reddit API
- Filter for r/WallStreetBets “DD” posts
- For each DD:
  - Send post to LLM (Amazon Bedrock or other)
  - If meets threshold → send notification
  - Optionally archive to S3

**Pseudocode**:
```python
def handler(event, context):
    posts = fetch_wallstreetbets_posts()
    dd_posts = filter_for_dd(posts)

    for post in dd_posts:
        llm_result = evaluate_with_llm(post)
        if llm_result["quality_score"] > threshold:
            send_notification(post, llm_result)

        # Optional: store to S3 for audit
        save_to_s3(post)
```

---

## 🔐 IAM Permissions for Lambda

- Internet access (via VPC NAT or public Lambda)
- `s3:PutObject` (if archiving to S3)
- `bedrock:InvokeModel` (or other LLM API permissions)
- `sns:Publish` or `ses:SendEmail` or Slack webhook call permissions

---

## 🧠 LLM Integration

Use Amazon Bedrock or other LLM via API.

**Prompt**:
> “Rate the following WallStreetBets DD post on a scale from 0 to 10 for insight, credibility, and relevance.”

**Expected Response**:
```json
{
  "quality_score": 8.2,
  "summary": "Solid analysis on NVDA's long-term growth."
}
```

---

## 💾 Optional: Archive to S3

- Bucket: `dd-posts-bucket`
- Key format: `archive/dd_<timestamp>.json`

---

## 📨 Notification Logic

**If score > threshold**:  
Send email, Slack message, or push via SNS.

**Example**:
```python
send_notification(post, llm_result):
    subject = f"[DD Alert] {post['title']} - Score: {llm_result['quality_score']}"
    body = f"{post['body']}\n\nLLM Summary: {llm_result['summary']}\nURL: {post['url']}"
    sns.publish(TopicArn="...", Message=body, Subject=subject)
```

---

## ✅ Benefits

- Simple: Single Lambda, no queues.
- Cost-effective: No extra infra.
- Scalable: Easily split into multiple functions later.
- Extensible: Add metrics, retries, or logging anytime.
