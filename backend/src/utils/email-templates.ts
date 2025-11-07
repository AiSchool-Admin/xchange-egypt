/**
 * Email Templates
 *
 * HTML email template generator for various notification types
 */

// ============================================
// Base Template
// ============================================

const baseTemplate = (content: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xchange Notification</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #333333;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #2563eb;
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #2563eb;
      font-size: 24px;
      margin-top: 0;
    }
    .content p {
      margin: 15px 0;
      color: #555555;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      margin: 20px 0;
      background-color: #2563eb;
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
    }
    .footer {
      background-color: #f8f8f8;
      padding: 20px 30px;
      text-align: center;
      font-size: 14px;
      color: #999999;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
    .info-box {
      background-color: #f0f9ff;
      border-left: 4px solid: #2563eb;
      padding: 15px;
      margin: 20px 0;
    }
    .warning-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
    }
    .success-box {
      background-color: #d1fae5;
      border-left: 4px solid #10b981;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Xchange</h1>
      <p style="margin: 5px 0 0;">Egypt's Most Advanced Trading Platform</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© 2025 Xchange. All rights reserved.</p>
      <p>
        <a href="#">Unsubscribe</a> |
        <a href="#">Manage Preferences</a> |
        <a href="#">Help Center</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

// ============================================
// Template Generators
// ============================================

/**
 * Generate email template based on notification type
 */
export const generateEmailTemplate = (
  type: string,
  data: Record<string, any>
): string => {
  const {
    userName = 'User',
    title,
    message,
    actionUrl,
    actionText = 'View Details',
  } = data;

  let content = '';

  switch (type) {
    case 'AUCTION_NEW_BID':
      content = `
        <h2>New Bid on Your Auction! 🎉</h2>
        <p>Hi ${userName},</p>
        <p>${data.bidderName} placed a bid of <strong>${data.bidAmount} EGP</strong> on your auction.</p>
        <div class="info-box">
          <p><strong>Current Status:</strong> Your auction is active and receiving bids!</p>
        </div>
        ${actionUrl ? `<a href="${actionUrl}" class="button">${actionText}</a>` : ''}
        <p>Keep track of your auction to see how it's performing.</p>
      `;
      break;

    case 'AUCTION_OUTBID':
      content = `
        <h2>You Were Outbid! ⚡</h2>
        <p>Hi ${userName},</p>
        <p>Someone outbid you on <strong>"${data.auctionTitle}"</strong>.</p>
        <div class="warning-box">
          <p><strong>New Bid:</strong> ${data.newBidAmount} EGP</p>
        </div>
        ${actionUrl ? `<a href="${actionUrl}" class="button">Place New Bid</a>` : ''}
        <p>Act fast before the auction ends!</p>
      `;
      break;

    case 'AUCTION_WON':
      content = `
        <h2>Congratulations! You Won! 🏆</h2>
        <p>Hi ${userName},</p>
        <p>You won the auction for <strong>"${data.auctionTitle}"</strong> with a bid of <strong>${data.winningBid} EGP</strong>.</p>
        <div class="success-box">
          <p><strong>Next Steps:</strong> Complete your purchase to finalize the transaction.</p>
        </div>
        ${actionUrl ? `<a href="${actionUrl}" class="button">Complete Purchase</a>` : ''}
      `;
      break;

    case 'REVERSE_AUCTION_NEW_REQUEST':
      content = `
        <h2>New Buying Request! 💰</h2>
        <p>Hi ${userName},</p>
        <p>Someone is looking for: <strong>"${data.requestTitle}"</strong></p>
        ${data.maxBudget ? `<div class="info-box"><p><strong>Budget:</strong> ${data.maxBudget} EGP</p></div>` : ''}
        ${actionUrl ? `<a href="${actionUrl}" class="button">Submit Your Bid</a>` : ''}
        <p>Compete with other sellers to win this deal!</p>
      `;
      break;

    case 'REVERSE_AUCTION_AWARDED':
      content = `
        <h2>Your Bid Was Accepted! 🎉</h2>
        <p>Hi ${userName},</p>
        <p>Great news! Your bid of <strong>${data.winningBid} EGP</strong> for "${data.requestTitle}" was accepted!</p>
        <div class="success-box">
          <p><strong>Next Steps:</strong> Contact the buyer to complete the transaction.</p>
        </div>
        ${actionUrl ? `<a href="${actionUrl}" class="button">View Details</a>` : ''}
      `;
      break;

    case 'BARTER_OFFER_RECEIVED':
      content = `
        <h2>New Barter Offer! 🔄</h2>
        <p>Hi ${userName},</p>
        <p>${data.initiatorName} wants to trade with you!</p>
        <div class="info-box">
          <p><strong>They're offering:</strong> ${data.offeredItems?.join(', ')}</p>
        </div>
        ${actionUrl ? `<a href="${actionUrl}" class="button">View Offer</a>` : ''}
        <p>Review the offer and decide if you want to accept or counter-offer.</p>
      `;
      break;

    case 'BARTER_OFFER_ACCEPTED':
      content = `
        <h2>Barter Offer Accepted! 🤝</h2>
        <p>Hi ${userName},</p>
        <p>${data.recipientName} accepted your barter offer!</p>
        <div class="success-box">
          <p><strong>Next Steps:</strong> Coordinate with ${data.recipientName} to complete the exchange.</p>
        </div>
        ${actionUrl ? `<a href="${actionUrl}" class="button">View Details</a>` : ''}
      `;
      break;

    case 'USER_WELCOME':
      content = `
        <h2>Welcome to Xchange! 🎉</h2>
        <p>Hi ${userName},</p>
        <p>Welcome to <strong>Xchange</strong>, Egypt's most advanced trading platform!</p>
        <div class="info-box">
          <p><strong>What you can do:</strong></p>
          <ul>
            <li>Buy and sell items</li>
            <li>Participate in auctions</li>
            <li>Trade items through barter</li>
            <li>Create reverse auctions</li>
          </ul>
        </div>
        <a href="/" class="button">Start Trading</a>
        <p>If you have any questions, our support team is here to help!</p>
      `;
      break;

    case 'USER_EMAIL_VERIFICATION':
      content = `
        <h2>Verify Your Email Address</h2>
        <p>Hi ${userName},</p>
        <p>Please verify your email address to activate your Xchange account.</p>
        <a href="${actionUrl}" class="button">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      `;
      break;

    case 'USER_PASSWORD_RESET':
      content = `
        <h2>Reset Your Password</h2>
        <p>Hi ${userName},</p>
        <p>We received a request to reset your password.</p>
        <a href="${actionUrl}" class="button">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `;
      break;

    default:
      // Generic template
      content = `
        <h2>${title}</h2>
        <p>Hi ${userName},</p>
        <p>${message}</p>
        ${actionUrl ? `<a href="${actionUrl}" class="button">${actionText}</a>` : ''}
      `;
  }

  return baseTemplate(content);
};

/**
 * Generate plain text version from HTML
 */
export const htmlToText = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};
