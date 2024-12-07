function init() {
    var w = 500; // Width of the chart
    var h = 300; // Increased height of the chart
    var margin = { top: 20, right: 20, bottom: 60, left: 50 }; // Adjusted margins for better spacing

    var innerWidth = w - margin.left - margin.right;
    var innerHeight = h - margin.top - margin.bottom;

    var dataset = []; // Dataset variable

    // Load CSV file
    d3.csv("Table_Input.csv", function (d) {
        return {
            index: d.Index, // Use the correct column name ("Index")
            value: +d.Value // Convert the "Value" column to a number
        };
    }).then(function (data) {
        // Filter out invalid data
        dataset = data.filter(d => !isNaN(d.value));

        if (dataset.length === 0) {
            console.error("Dataset is empty. Check the CSV file or data loading logic.");
            return;
        }

        // Create scales
        var xScale = d3.scaleBand()
            .domain(dataset.map(d => d.index)) // Use the "index" for the X-axis
            .range([0, innerWidth])
            .padding(0.05);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, d => d.value)])
            .range([innerHeight, 0]);

        // Create SVG container
        var svg = d3.select("#chart")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        var chartGroup = svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Create Axes
        var xAxis = d3.axisBottom(xScale);
        var yAxis = d3.axisLeft(yScale);

        // Add X-axis
        chartGroup.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${innerHeight})`)
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Add Y-axis
        chartGroup.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

        // Add text label for Y-axis
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 10)
            .attr("x", -innerHeight / 2)
            .attr("dy", "-1em")
            .style("text-anchor", "middle")
            .text("Values");

        // Add text label for X-axis
        chartGroup.append("text")
            .attr("x", innerWidth / 2)
            .attr("y", innerHeight + margin.bottom - 10)
            .style("text-anchor", "middle")
            .text("Index");

        // Function to render bars
        function renderBars() {
            var bars = chartGroup.selectAll("rect").data(dataset);

            // Enter + Update
            var barsEnter = bars.enter()
                .append("rect")
                .merge(bars);

            barsEnter
                .transition()
                .duration(500)
                .attr("x", d => xScale(d.index))
                .attr("y", d => yScale(d.value))
                .attr("width", xScale.bandwidth())
                .attr("height", d => innerHeight - yScale(d.value))
                .attr("fill", "rgb(106, 90, 205)");

            // Add hover interactions
            barsEnter.merge(bars)
                .on("mouseover", function (event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("fill", "orange");

                    var xPosition = parseFloat(d3.select(this).attr("x")) + xScale.bandwidth() / 2;
                    var yPosition = yScale(d.value) - 5;

                    // Append text when hovering
                    chartGroup.append("text")
                        .attr("id", "tooltip")
                        .attr("x", xPosition)
                        .attr("y", yPosition)
                        .attr("text-anchor", "middle")
                        .attr("fill", "black")
                        .text(d.value);
                })
                .on("mouseout", function () {
                    d3.select("#tooltip").remove();
                    d3.select(this)
                        .transition()
                        .duration(500)
                        .attr("fill", "rgb(106, 90, 205)");
                });

            // Remove old elements
            bars.exit().remove();
        }

        // Initial rendering of the chart
        renderBars();

        // Step 1: Process Table 1 data for calculations
        const table1Dict = {};
        dataset.forEach(row => {
            table1Dict[row.index] = row.value; // Create a dictionary for easy lookup
        });

        // Perform calculations for Table 2
        const alpha = table1Dict["A5"] + table1Dict["A20"]; // A5 + A20
        const beta = Math.round(table1Dict["A15"] / table1Dict["A7"]); // A15 / A7
        const charlie = table1Dict["A13"] * table1Dict["A12"]; // A13 * A12

        const table2Data = [
            { category: "Alpha", value: alpha },
            { category: "Beta", value: beta },
            { category: "Charlie", value: charlie }
        ];

        // Step 2: Populate Table 2 using D3.js
        const table2Body = d3.select("#table2 tbody");

        table2Data.forEach(row => {
            const tr = table2Body.append("tr");

            tr.append("td")
                .text(row.category)
                .style("border", "1px solid black")
                .style("padding", "8px");

            tr.append("td")
                .text(row.value)
                .style("border", "1px solid black")
                .style("padding", "8px");
        });
    }).catch(function (error) {
        console.error("Error loading CSV data:", error);
    });
}

// Initialize the chart when the window loads
window.onload = init;
