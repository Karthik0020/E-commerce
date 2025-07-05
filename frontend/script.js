// Function to load and display items in the wishlist
function loadWishlist() {
  const wishlistContainer = document.getElementById("wishlist-items");
  const emptyMsg = document.getElementById("empty-msg");

  // Fetch the wishlist from localStorage
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  // Clear the wishlist container
  wishlistContainer.innerHTML = "";

  // Show message if wishlist is empty
  if (wishlist.length === 0) {
    emptyMsg.style.display = "block";
    return;
  }

  // Hide the empty message if there are items in the wishlist
  emptyMsg.style.display = "none";

  // Loop through the wishlist and create item elements
  wishlist.forEach((item, index) => {
    const itemCard = document.createElement("div");
    itemCard.className = "wishlist-item";
    itemCard.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.product}">
      <h4>${item.product}</h4>
      <p><strong>${item.brand}</strong></p>
      <p>${item.price}</p>
      <button class="btn-cart" onclick="addToCart(${index})">Add to Cart</button>
      <button class="btn-remove" onclick="removeFromWishlist(${index})">Remove</button>
    `;
    wishlistContainer.appendChild(itemCard);
  });
}

// Function to remove an item from the wishlist
function removeFromWishlist(index) {
  // Retrieve wishlist from localStorage
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  // Remove the item from the array
  wishlist.splice(index, 1);

  // Save the updated wishlist back to localStorage
  localStorage.setItem("wishlist", JSON.stringify(wishlist));

  // Reload the wishlist after removal
  loadWishlist();
}

// Function to add an item to the cart (you can modify this as needed)
function addToCart(index) {
  // Optionally, implement cart logic here
  alert("Added to cart! (You can implement cart logic separately)");
}

// Function to add a product to the wishlist
function addToWishlist(product) {
  // Retrieve the current wishlist from localStorage
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  // Check if the product already exists in the wishlist
  const exists = wishlist.some(item => item.product === product.product);

  if (!exists) {
    // If the product is not in the wishlist, add it
    wishlist.push(product);

    // Save the updated wishlist to localStorage
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    alert("Product added to wishlist!");
  } else {
    alert("This product is already in your wishlist!");
  }
}

// Initialize the wishlist when the page loads
document.addEventListener("DOMContentLoaded", loadWishlist);
