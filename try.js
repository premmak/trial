let cart = []; // Array to hold cart items
const stock = {
    'stock1': 50, // Initial stock for A4 Blank Papers
    'stock2': 50, // Initial stock for A4 Single-Side Ruled Papers
    'stock3': 50, // Initial stock for A4 Double-Side Ruled Papers
    'stock4': 100, // Initial stock for Cardboard Files
};

// Function to add items to the cart
function addToCart(productName, price, stockId) {
    if (stock[stockId] > 0) {
        const existingCartItem = cart.find(item => item.name === productName);
        if (existingCartItem) {
            existingCartItem.quantity += 1; // Increment quantity if item already in cart
        } else {
            cart.push({ name: productName, price: price, quantity: 1, stockId: stockId });
        }
        stock[stockId] -= 1; // Decrement stock
        document.getElementById(stockId).innerText = stock[stockId]; // Update stock display
        displayCart(); // Display cart items
        updateOrderSummary(); // Update the order summary table
    } else {
        alert('Sorry, this item is out of stock.'); // Alert for out of stock
    }
}

// Function to display the cart items
function displayCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; // Clear current cart display
    let total = 0; // Initialize total

    // Loop through cart items and display them
    cart.forEach((item, index) => {
        total += item.price * item.quantity; // Calculate total
        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                ${item.name} - ₹${item.price} x ${item.quantity}
                <button onclick="removeFromCart(${index}, '${item.stockId}')">Remove</button>
            </div>
        `;
    });

    document.getElementById('cart-total').innerText = total; // Display total amount
}

// Function to remove items from the cart
function removeFromCart(index, stockId) {
    const removedItem = cart[index]; // Get the item being removed
    stock[stockId] += removedItem.quantity; // Add back the stock
    document.getElementById(stockId).innerText = stock[stockId]; // Update stock display
    cart.splice(index, 1); // Remove item from cart
    displayCart(); // Update cart display
    updateOrderSummary(); // Update order summary
}

// Razorpay payment integration
function checkout() {
    const totalAmount = document.getElementById('cart-total').innerText; // Get total amount
    const options = {
        key: 'your_razorpay_key', // Replace with your Razorpay key
        amount: totalAmount * 100, // Amount in paise
        currency: 'INR',
        name: 'Stationery Store',
        description: 'Purchase',
        handler: function (response) {
            alert('Payment successful! Transaction ID: ' + response.razorpay_payment_id); // Alert on successful payment
            generateInvoice(response.razorpay_payment_id); // Generate invoice
            clearCart(); // Clear cart after payment
        },
        prefill: {
            name: '',
            email: '',
            contact: ''
        },
        theme: {
            color: '#3399cc'
        }
    };
    const rzp = new Razorpay(options); // Create Razorpay instance
    rzp.open(); // Open Razorpay modal
}

// Function to clear the cart after payment
function clearCart() {
    cart = []; // Reset cart
    displayCart(); // Update cart display
    updateOrderSummary(); // Update order summary
    document.getElementById('cart-total').innerText = 0; // Reset total
}

// Function to update the order summary table
function updateOrderSummary() {
    const summaryBody = document.getElementById('order-summary-body');
    const summaryTotal = document.getElementById('summary-total');
    summaryBody.innerHTML = ''; // Clear current summary
    let total = 0; // Initialize total

    // Loop through cart items and generate table rows
    cart.forEach((item) => {
        const subtotal = item.price * item.quantity; // Calculate subtotal
        total += subtotal; // Update total
        const row = `
            <tr>
                <td>${item.name}</td>
                <td>₹${item.price}</td>
                <td>${item.quantity}</td>
                <td>₹${subtotal}</td>
            </tr>
        `;
        summaryBody.innerHTML += row; // Add each row to the table
    });

    summaryTotal.innerText = `₹${total}`; // Update total amount in summary
}

// Function to generate and download the invoice PDF
function generateInvoice(paymentId) {
    const { jsPDF } = window.jspdf; // Access jsPDF
    const doc = new jsPDF(); // Create new jsPDF document

    // Header
    doc.setFontSize(18);
    doc.text("Stationery Store Invoice", 20, 20); // Title

    // Payment ID and Date
    doc.setFontSize(12);
    const date = new Date().toLocaleString(); // Get current date
    doc.text(`Date: ${date}`, 20, 30); // Date
    doc.text(`Payment ID: ${paymentId}`, 20, 40); // Payment ID

    // Invoice table header
    doc.text("Product", 20, 50);
    doc.text("Price", 150, 50);
    doc.text("Quantity", 110, 50);
    doc.text("Subtotal", 180, 50);

    // Cart items
    let y = 60;
    let totalAmount = 0;

    cart.forEach((item) => {
        const subtotal = item.price * item.quantity; // Calculate subtotal
        doc.text(item.name, 20, y); // Product name
        doc.text(`₹${item.price}`, 150, y); // Price
        doc.text(`${item.quantity}`, 110, y); // Quantity
        doc.text(`₹${subtotal}`, 180, y); // Subtotal
        y += 10; // Move down for next item
        totalAmount += subtotal; // Update total amount
    });

    // Total amount
    doc.text(`Total: ₹${totalAmount}`, 20, y + 10); // Total

    // Save the PDF
    doc.save(`Invoice_${paymentId}.pdf`); // Save the PDF with payment ID
}
