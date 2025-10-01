const svgElement = document.getElementById("bloodDonationSvg");
const groupElement = document.getElementById("bloodTypes");
let currentRotation = 0;

function updateRotation(event) {
	// Identify the clicked element and check constraints
	const clickedElement = event.target;
	const dataValue = clickedElement.dataset.rotation;

	// Proceed only if a valid circle was clicked
	if (clickedElement.tagName === "circle" && dataValue) {
		const donateString = clickedElement.dataset.donate;
		const donateColor = clickedElement.getAttribute("stroke");
		const donateArray = donateString.split(",");

		// Select all <animate> elements within the bloodWire group
		const allAnimations = document.querySelectorAll(".bloodWire animate");

		allAnimations.forEach((animElt) => {
			const hostUse = animElt.parentElement;
			try {
				animElt.endElement();
			} catch (e) {
				// Safely ignore errors if endElement is called when not animating
			}
			const initialOffset = hostUse.getAttribute("stroke-dasharray");
			if (initialOffset) {
				hostUse.setAttribute("stroke-dashoffset", initialOffset);
			}
			// This ensures the animation is in its pristine begin state
			const newAnimElt = animElt.cloneNode(true);
			hostUse.replaceChild(newAnimElt, animElt);
		});

		// Set the 'bloodWire' stroke to the color of the clicked circle
		document.querySelector(".bloodWire").setAttribute("stroke", donateColor);

		const targetRotation = parseFloat(dataValue);

		// Calculate the shortest rotation path
		let rotationDiff = targetRotation - currentRotation;

		// Normalize to shortest path (-180 to 180)
		while (rotationDiff > 180) rotationDiff -= 360;
		while (rotationDiff < -180) rotationDiff += 360;

		// Update current rotation
		currentRotation += rotationDiff;

		// Apply smooth transform with CSS transition
		groupElement.style.transition =
			"transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)";
		groupElement.setAttribute('transform', `translate(50 -15) rotate(${currentRotation} 0 0) translate(-50 15)`);
		const peeps = document.querySelectorAll(`.peep`);
		peeps.forEach((peep)=> {
			peep.removeAttribute('fill');
			peep.classList.remove('animating');
		});
		const donorTexts = document.querySelectorAll('.donor');
		for (let i=0; i<donorTexts.length; i++) {
			donorTexts[i].classList.remove('selectedDonor');
		}
		const recipientTexts = document.querySelectorAll('.recipient');
		for (let i=0; i<recipientTexts.length; i++) {
			recipientTexts[i].classList.remove('selectedRecipient');
		}
		
		// Small delay to ensure DOM updates are processed before starting new animations
		requestAnimationFrame(() => {
			const textElt = document.querySelector(`.donor[data-value="${clickedElement.dataset.value}"]`);

				if (textElt) {
					textElt.classList.add('selectedDonor');
				}
			// Find and start the animations for the donation targets
			donateArray.forEach((bloodTo) => {
				// Re-query because we replaced the elements
				const animElt = document.querySelector(`animate[data-value="${bloodTo}"]`);
				const textElt = document.querySelector(`.recipient[data-value="${bloodTo}"]`);

				if (textElt) {
					textElt.classList.add('selectedRecipient');
				}
				if (animElt) {
					// Set fill to freeze and begin the animation
					animElt.setAttribute("fill", "freeze");
					animElt.beginElement();
						const peep = document.querySelector(`.peep[data-value="${bloodTo}"]`);
						peep.classList.add('animating');
						peep.setAttribute("fill", donateColor);
				}
			});
		});
	}
}
// Attach the rotation function to the click event of the entire SVG area
if (svgElement) {
	svgElement.addEventListener("click", updateRotation);
} else {
	console.error("SVG element not found. Check the ID.");
}

// trigger the first one to start
window.addEventListener("DOMContentLoaded", () => {
  const firstCircle = document.querySelector("#bloodTypes circle:nth-child(5)");
  if (firstCircle) {
    updateRotation({ target: firstCircle });
  }
});