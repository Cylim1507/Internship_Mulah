import requests
from bs4 import BeautifulSoup
from datetime import datetime

TARGET_URL = "https://www.theverge.com/"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"}

def scrape_articles():
    # Fetch the webpage content
    response = requests.get(TARGET_URL, headers=headers)

    if response.status_code != 200:
        print(f"Failed to fetch data. Status code: {response.status_code}")
        return []

    soup = BeautifulSoup(response.content, "html.parser")

    # Adjust the selector to match the website's structure
    articles = soup.select("#content a[href]")  # Generic selector to fetch all links in #content

    if not articles:
        print("No articles matched the given selector.")
        return []

    titles_links = []
    seen_links = set()  # To track already added links
    for article in articles:
        title = article.get_text(strip=True)
        link = article["href"]

        # Skip duplicates and "Comments" links
        if link in seen_links or "showComments" in link:
            continue
        seen_links.add(link)

        # Skip entries with empty titles
        if not title:
            continue

        # Parse the date from the URL (assuming it's in the format /YYYY/MM/DD/)
        # Example: /2024/12/9/article-title
        try:
            parts = link.split("/")
            year = int(parts[1])
            month = int(parts[2])
            day = int(parts[3])
            pub_date = datetime(year, month, day)
        except (IndexError, ValueError):
            continue  # Skip articles without a valid date in the URL

        # Only include articles published from January 1, 2022, onwards
        if pub_date >= datetime(2022, 1, 1):
            titles_links.append({"title": title, "link": link, "date": pub_date})

    # Return articles sorted by date (most recent first)
    return sorted(titles_links, key=lambda x: x["date"], reverse=True)

if __name__ == "__main__":
    articles = scrape_articles()

    if not articles:
        print("No articles found or an error occurred.")
    else:
        for article in articles:
            print(f"Title: {article['title']}\nLink: https://www.theverge.com{article['link']}\nDate: {article['date'].strftime('%Y-%m-%d')}\n")
