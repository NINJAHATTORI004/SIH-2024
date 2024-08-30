const textInput = document.getElementById("text-input");
const popupOpenButton = document.getElementById("popup-open");
const chatbotContainer = document.getElementById("container");
const popupCloseButton = document.getElementById("popup-close");

function sendMessage() {
  const message = textInput.value;
  if (message.trim() === "") return;

  // Display user message
  const chatBox = document.getElementById("chat-box");
  const userMessage = document.createElement("div");
  userMessage.textContent = `You: ${message}`;
  chatBox.appendChild(userMessage);

  // Send message to the server
  fetch("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  })
    .then((response) => response.json())
    .then((data) => {
      const botMessage = document.createElement("div");
      botMessage.textContent = `Bot: ${data.response}`;
      chatBox.appendChild(botMessage);
      chatBox.scrollTop = chatBox.scrollHeight;

      if (data.response.includes('Your ticket has been generated')) {
        const ticketLink = document.createElement('a');
        ticketLink.href = 'ticket.pdf';
        ticketLink.textContent = 'Download your ticket';
        ticketLink.target = '_blank';
        chatBox.appendChild(ticketLink);
      }
    });

  textInput.value = "";
}

function startVoiceRecognition() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US"; // Change language code as needed
  recognition.start();

  recognition.onresult = function (event) {
    const voiceMessage = event.results[0][0].transcript;
    document.getElementById("text-input").value = voiceMessage;
    sendMessage();
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error", event.error);
  };

  recognition.onend = function () {
    console.log("Speech recognition service disconnected");
  };
}

function startImageRecognition() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
      const base64Image = e.target.result.split(",")[1];

      const response = await fetch(
        "https://vision.googleapis.com/v1/images:annotate?key=YOUR_GOOGLE_CLOUD_VISION_API_KEY",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: base64Image,
                },
                features: [
                  {
                    type: "LABEL_DETECTION",
                    maxResults: 10,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const labels = data.responses[0].labelAnnotations.map((label) => label.description).join(", ");

      const chatBox = document.getElementById("chat-box");
      const botMessage = document.createElement("div");
      botMessage.textContent = `Bot: I see the following in the image: ${labels}`;
      chatBox.appendChild(botMessage);
      chatBox.scrollTop = chatBox.scrollHeight;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function makePayment() {
  const amount = document.getElementById("amount").value;
  if (amount.trim() === "") return;

  fetch('/pay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amount: parseInt(amount) * 100, currency: 'INR' }) // Amount in paise
  })
  .then(response => response.json())
  .then(data => {
    const options = {
      "key": "rzp_test_p9DwWiTZQqSyJk", // Enter the Key ID generated from the Dashboard
      "amount": data.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 means 50000 paise or ₹500.
      "currency": "INR",
      "name": "Museum Ticket Booking",
      "description": "Ticket Booking Payment",
      "order_id": data.id, // This is a sample Order ID. Pass the `id` obtained in the previous step
      "handler": function (response){
        alert('Payment successful. Payment ID: ' + response.razorpay_payment_id);
      },
      "prefill": {
        "name": "Your Name",
        "email": "your.email@example.com",
        "contact": "9999999999"
      },
      "theme": {
        "color": "#3399cc"
      }
    };
    const rzp1 = new Razorpay(options);
    rzp1.open();
  });
}

textInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});
popupOpenButton.addEventListener("click", () => {
  chatbotContainer.classList.toggle("hidden");
  popupOpenButton.classList.toggle("hidden");
});
popupCloseButton.addEventListener("click", () => {
  chatbotContainer.classList.toggle("hidden");
  popupOpenButton.classList.toggle("hidden");
});