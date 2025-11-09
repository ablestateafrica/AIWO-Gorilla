// Mobile Sidebar Toggle Script

document.addEventListener("DOMContentLoaded", function () {
	const sidebar = document.querySelector(".sidebar");
	const main = document.querySelector(".main");

	// Open sidebar by default on tablet and desktop
	if (window.innerWidth >= 768) {
		sidebar.classList.add("open");
	}

	// Create sidebar toggle button with panel + arrow icon
	const menuButton = document.createElement("button");
	menuButton.id = "menuToggle";
	menuButton.className = "menu-toggle";
	menuButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="9" y1="3" x2="9" y2="21"></line>
      <polyline points="14 8 18 12 14 16"></polyline>
    </svg>
  `;
	menuButton.setAttribute("aria-label", "Toggle sidebar");
	menuButton.title = "Toggle sidebar";

	// Add button to header - insert before the select element
	const mainHeader = document.getElementById("mainHeader");
	const modelSelect = document.getElementById("modelSelect");
	if (mainHeader && modelSelect) {
		mainHeader.insertBefore(menuButton, modelSelect);
	} else if (mainHeader) {
		mainHeader.insertBefore(menuButton, mainHeader.firstChild);
	}

	// Create overlay for closing sidebar
	const overlay = document.createElement("div");
	overlay.className = "sidebar-overlay";
	document.body.appendChild(overlay);

	// Toggle sidebar function
	function toggleSidebar() {
		sidebar.classList.toggle("open");

		// Only show overlay on mobile
		if (window.innerWidth < 768) {
			overlay.classList.toggle("active");
			document.body.classList.toggle("sidebar-open");
		}

		// Update ARIA attribute
		const isOpen = sidebar.classList.contains("open");
		menuButton.setAttribute("aria-expanded", isOpen);
	}

	// Close sidebar function
	function closeSidebar() {
		sidebar.classList.remove("open");
		overlay.classList.remove("active");
		document.body.classList.remove("sidebar-open");
		menuButton.setAttribute("aria-expanded", "false");
	}

	// Event listeners
	menuButton.addEventListener("click", toggleSidebar);
	overlay.addEventListener("click", closeSidebar);

	// Close sidebar when clicking inside sidebar (mobile only)
	sidebar.addEventListener("click", function (e) {
		// Only on mobile
		if (window.innerWidth < 768) {
			// Don't close if clicking on input elements or the sidebar itself (for scrolling)
			if (e.target === sidebar || e.target.closest(".body")) {
				return;
			}
			closeSidebar();
		}
	});

	// Close sidebar when clicking links inside it (optional)
	const sidebarLinks = sidebar.querySelectorAll("a, button:not(#menuToggle)");
	sidebarLinks.forEach((link) => {
		link.addEventListener("click", function (e) {
			// Only close on mobile when clicking actionable items
			if (window.innerWidth < 768) {
				// Close sidebar after a short delay to allow the action to complete
				setTimeout(closeSidebar, 150);
			}
		});
	});

	// Close sidebar on escape key
	document.addEventListener("keydown", function (e) {
		if (e.key === "Escape" && sidebar.classList.contains("open")) {
			closeSidebar();
		}
	});

	// Handle window resize - close sidebar overlay on mobile, keep behavior on desktop
	let resizeTimer;
	window.addEventListener("resize", function () {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function () {
			// On mobile, if sidebar is open and window resizes, adjust overlay
			if (window.innerWidth < 768) {
				if (sidebar.classList.contains("open")) {
					overlay.classList.add("active");
				}
			} else {
				// On tablet/desktop, remove overlay and open sidebar by default
				overlay.classList.remove("active");
				document.body.classList.remove("sidebar-open");
				sidebar.classList.add("open");
			}
		}, 250);
	});
});
