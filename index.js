function init() {
    var w = 500;
    var h = 130;
    var isAscending = true; // Flag for sorting direction
    var dataset = [];
    var originalData = []; // To store the original dataset

    // Load CSV file
    d3.csv("Table_Input.csv", function(d) {
        return {
            index: d.index,
            value: +d.value
        };
    }).then(function(data) {
        dataset = data;
        originalData = [...data]; // Store a copy of the original data

        console.log("Data Loaded:", dataset);

        if (dataset.length === 0) {
            console.error("Dataset is empty. Check CSV file or data loading logic.");
            return;
        }

        // Define scales
        var xScale = d3.scaleBand()
            .domain(d3.range(dataset.length))
            .range([0, w])
            .padding(0.05);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, d => d.value)])
            .range([h, 0]);

        // Create SVG inside the chart element
        var svg = d3.select("#chart")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        console.log("SVG created:", svg);

        // Function to render bars
        function renderBars() {
            var bars = svg.selectAll("rect").data(dataset);

            // Enter + Update
            bars.enter()
                .append("rect")
                .merge(bars)
                .transition()
                .duration(500)
                .attr("x", (d, i) => xScale(i))
                .attr("y", d => yScale(d.value))
                .attr("width", xScale.bandwidth())
                .attr("height", d => h - yScale(d.value))
                .attr("fill", "rgb(106, 90, 205)");

            // Remove old elements
            bars.exit().remove();
        }

        // Initial render
        renderBars();

        // Sorting button
        d3.select("#sort").on("click", function() {
            dataset.sort((a, b) => isAscending ? d3.ascending(a.value, b.value) : d3.descending(a.value, b.value));
            isAscending = !isAscending;

            xScale.domain(d3.range(dataset.length)); // Update scale
            renderBars(); // Re-render
        });

        // Reset to original order
        d3.select("#original").on("click", function() {
            dataset = [...originalData]; // Restore original dataset
            xScale.domain(d3.range(dataset.length)); // Update scale
            renderBars(); // Re-render
        });
    }).catch(function(error) {
        console.error("Error loading CSV data:", error);
    });
}

window.onload = init;
