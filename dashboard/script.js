async function loadResult() {
    try {
        const response = await fetch("result.json?t=" + Date.now(), {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Could not load result.json");
        }

        const data = await response.json();

        console.log("RESULT RECEIVED FROM result.json:", data);
        console.log("RESULT URL:", response.url);

        document.getElementById("scramble").textContent = data.scramble;
        document.getElementById("solution").textContent = data.solution;
        document.getElementById("moves").textContent = data.moves;

        if (document.getElementById("algorithm")) {
            document.getElementById("algorithm").textContent = data.algorithm;
        }

        if (document.getElementById("heuristic")) {
            document.getElementById("heuristic").textContent = data.heuristic;
        }

    } catch (error) {
        console.error("Error loading result:", error);
    }
}


// Load the current result when the dashboard opens
loadResult();


// Reset dashboard display
function resetCube() {
    document.getElementById("scramble").textContent = "—";
    document.getElementById("solution").textContent = "—";
    document.getElementById("moves").textContent = "—";

    if (document.getElementById("algorithm")) {
        document.getElementById("algorithm").textContent = "—";
    }

    if (document.getElementById("heuristic")) {
        document.getElementById("heuristic").textContent = "—";
    }
}


// Solve cube using the shuffle depth entered by the user
async function solveCube() {
    const depthElement = document.getElementById("shuffleDepth");

    if (!depthElement) {
        console.error("shuffleDepth input not found");
        return;
    }

    const depth = Number(depthElement.value);

    if (!Number.isInteger(depth) || depth < 0) {
        alert("Please enter a valid shuffle depth.");
        return;
    }

    console.log("Sending shuffle depth:", depth);

    try {
        const response = await fetch("http://localhost:8080/solve", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                shuffleDepth: depth
            })
        });

        if (!response.ok) {
            throw new Error("Server returned HTTP " + response.status);
        }

        const data = await response.json();

        console.log("SERVER RESPONSE:", data);

        if (data.status === "success") {

            // Give the server a moment to finish writing result.json
            await new Promise(resolve => setTimeout(resolve, 100));

            // Load the newly generated result
            await loadResult();

        } else {
            console.error("Solver failed:", data);
            alert("Solver failed. Check the server terminal.");
        }

    } catch (error) {
        console.error("Error solving cube:", error);
        alert("Could not connect to the solver server.");
    }
}