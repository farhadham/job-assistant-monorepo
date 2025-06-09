(async () => {
  const ALERT_MSG =
    "Website has been changed. Please contact farhadham2@gmail.com for new updates.";

  const getTextContent = (selector, required = true) => {
    const element = document.querySelector(selector);
    if (!element) {
      if (required) alert(ALERT_MSG);
      return undefined;
    }
    return element.innerText.trim();
  };

  const getAttribute = (selector, attr, required = true) => {
    const element = document.querySelector(selector);
    if (!element) {
      if (required) alert(ALERT_MSG);
      return undefined;
    }
    return element.getAttribute(attr);
  };

  // Getting job ID
  const currentUrl = new URL(window.location.href);
  const currentJobId = currentUrl.searchParams.get("currentJobId");
  const url = `https://linkedin.com/jobs/view/${currentJobId}`;

  // Get posting date
  const postingDateText = getTextContent(
    "#main .job-details-jobs-unified-top-card__primary-description-container span:nth-child(1) > span:nth-child(3)",
  );
  const postingDate = postingDateText
    ? relativeTimeToISO(postingDateText)
    : undefined;

  // Get location
  const location = getTextContent(
    "#main .job-details-jobs-unified-top-card__primary-description-container span:nth-child(1) > span:nth-child(1)",
  );

  // Get title
  const title = getTextContent(
    "#main .display-flex.justify-space-between.flex-wrap.mt2 > div > h1",
  );

  // Get job description
  const jobDescription = getTextContent("#job-details > div.mt4 > p");

  // Get company info
  const companyElement = document.querySelector(
    "#main .display-flex.align-items-center.flex-1 > div > a",
  );
  let companyName, companyUrl;

  if (!companyElement) {
    alert(ALERT_MSG);
  } else {
    companyName = companyElement.textContent.trim();
    companyUrl = companyElement.getAttribute("href")?.replace(/\/life\/?$/, "");
  }

  // Get recruiter info
  const recruiter = getAttribute(
    "div[class*='hirer-card__hirer-information'] a",
    "href",
    false,
  );

  const data = {
    url,
    title,
    jobDescription,
    companyName,
    companyUrl,
    postingDate,
    recruiter,
    location,
    platform: "LinkedIn",
  };

  // Send data to local API
  chrome.runtime.sendMessage(
    {
      action: "postJobData",
      data,
    },
    (response) => {
      if (response) {
        if (!response.success && response.error) {
          chrome.runtime.sendMessage({
            action: "showError",
            error: response.error,
          });
        } else {
          chrome.runtime.sendMessage({
            action: "showSuccess",
            message: "Job data saved successfully!",
          });
        }
      }
    },
  );
})();

function relativeTimeToISO(relativeTime) {
  const now = new Date();

  const match = relativeTime.match(
    /(\d+)\s*(minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)\s+ago/,
  );

  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    if (unit.startsWith("minute")) {
      now.setMinutes(now.getMinutes() - value);
    } else if (unit.startsWith("hour")) {
      now.setHours(now.getHours() - value);
    } else if (unit.startsWith("day")) {
      now.setDate(now.getDate() - value);
    } else if (unit.startsWith("week")) {
      now.setDate(now.getDate() - value * 7);
    } else if (unit.startsWith("month")) {
      now.setMonth(now.getMonth() - value);
    } else if (unit.startsWith("year")) {
      now.setFullYear(now.getFullYear() - value);
    } else {
      return undefined; // Unsupported format
    }

    return now.toISOString();
  }
}
