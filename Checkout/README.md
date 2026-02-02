# Checkout - Premier Club

This is the checkout page for the Arco Premier Club subscription service.

## Structure

```
Checkout/
├── html/
│   └── index.html          # Main checkout page
├── css/
│   └── style.css           # All styling for the page
├── js/
│   └── js.js               # Interactive functionality
├── images/                 # (Reserved for images if needed)
└── README.md
```

## Features

### Left Section - Premier Club Plans
- Three subscription options:
  - 1 Month - $4.99 USD
  - 3 Months - $11.25 USD (Save 25%)
  - 12 Months - $29.99 USD (Save 50% - Most Popular)
- Radio button selection for choosing a plan
- Auto-renewal toggle switch
- Exit/Cancel button

### Right Section - Payment Details
- Email address input
- Card details form:
  - Name on card
  - Card number (auto-formatted with spaces)
  - Expiry date (MM/YY format)
  - CVC code
- Billing address:
  - Street address with optional apartment number
  - State and zip code
- Order summary displaying:
  - Selected plan and duration
  - Price
  - Taxes
- Pay button

## JavaScript Functionality

1. **Radio Button Selection**: Click any subscription card to select it
2. **Toggle Switch**: Click to enable/disable auto-renewal
3. **Dynamic Order Summary**: Updates based on selected plan
4. **Form Validation**: 
   - Validates all required fields
   - Email format validation
   - Ensures a plan is selected
5. **Input Formatting**:
   - Card number: Adds spaces every 4 digits
   - Expiry: Formats as MM/YY
   - CVC: Numbers only, max 3 digits
6. **Payment Processing**: Simulated payment handler (logs to console)

## Design System

### Colors
- Background White: `#fffefd`
- Background Grey: `#f1f0f0`
- Text Heading: `#1c1c1c`
- Text Body: `#8d8d8d`
- Border: `#dddcdb`

### Typography
- Headings: Poppins (Medium, SemiBold, Bold)
- Body: Lexend (Regular, SemiBold, Bold)

### Component Styling
- Border radius: 5px (buttons/inputs), 10px (badges), 12px (toggle), 20px (cards)
- Box shadows for depth
- Smooth transitions on interactive elements
- Responsive design for tablets and mobile

## Usage

Open `html/index.html` in a web browser with a local server to see the checkout page in action.

## Responsive Design

The page adapts to different screen sizes:
- Desktop: Two-column layout (plans left, payment right)
- Tablet/Mobile: Single column layout with sections stacked vertically
