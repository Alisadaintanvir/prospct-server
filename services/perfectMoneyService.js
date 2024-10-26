const generatePerfectMoneyForm = ({ amount, paymentId }) => {
  const formFields = {
    PAYEE_ACCOUNT: "U33367904",
    PAYEE_NAME: "Prospct",
    PAYMENT_ID: paymentId || Date.now(),
    PAYMENT_AMOUNT: amount,
    PAYMENT_UNITS: "USD",
    STATUS_URL: "https://yourbackend.com/payment/status",
    PAYMENT_URL: "https://app.prospct.io/success",
    PAYMENT_URL_METHOD: "LINK",
    NOPAYMENT_URL: "https://app.prospct.io/cancel",
    NOPAYMENT_URL_METHOD: "LINK",
  };

  // Generate HTML form as a string
  return `
      <form id="perfectMoneyForm" action="https://perfectmoney.com/api/step1.asp" method="POST">
        ${Object.keys(formFields)
          .map(
            (key) =>
              `<input type="hidden" name="${key}" value="${formFields[key]}">`
          )
          .join("")}
        <button type="submit">Proceed with Payment</button>
      </form>
      <script>document.getElementById('perfectMoneyForm').submit();</script>
    `;
};

module.exports = { generatePerfectMoneyForm };
