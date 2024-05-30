import * as d3 from 'd3';

export class CarbonFineCharts {
  constructor({ el, propertyData, energyData, propertyId }) {
    this.el = el;
    this.propertyData = propertyData;
    this.energyData = energyData;
    this.propertyId = propertyId;
    this.wrap = this.wrap.bind(this);
    this.init();
  }

  init() {
    this.processData();
    this.setup();
    this.render();
  }

  processData() {
    const penaltyMultiplier = 268;
    const periods = ["2024_2029", "2030_2034"];
    const accessors = {
      propertyId: (d) => d["property_id"],
      propertyUseType: (d) =>
        d["property_use_type"].toLowerCase().replace(/\//, " $& "),
      propertyEmission: (d, period) => +d[`emission_cap_${period}_tco2`],
      energyType: (d) => d["energy_type"].replace(/_/, " "),
      energyEmission: (d, period) => +d[`cce_${period}_tco2e`],
    };

    const filteredPropertyData = this.propertyData.filter(
      (d) => accessors.propertyId(d) === this.propertyId
    );
    const filteredEnergyData = this.energyData.filter(
      (d) => accessors.propertyId(d) === this.propertyId
    );

    this.data = periods.map((period) => {
      const propertyValues = d3
        .rollups(
          filteredPropertyData,
          (g) => d3.sum(g, (d) => accessors.propertyEmission(d, period)),
          (d) => accessors.propertyUseType(d, period)
        )
        .map(([key, value]) => ({ key, value }))
        .sort((a, b) => d3.descending(a.value, b.value));
      const energyValues = d3
        .rollups(
          filteredEnergyData,
          (g) => d3.sum(g, (d) => accessors.energyEmission(d, period)),
          (d) => accessors.energyType(d, period)
        )
        .map(([key, value]) => ({ key, value }))
        .sort((a, b) => d3.descending(a.value, b.value));
      const values = [
        {
          key: "property",
          xLabel: `${period.slice(0, 4)} carbon cap`,
          totalLabel: "Threshold",
          values: propertyValues,
        },
        {
          key: "energy",
          xLabel: `${period.slice(0, 4)} carbon emission`,
          totalLabel: "Emission",
          values: energyValues,
        },
      ];
      return {
        key: period,
        values,
      };
    });

    const stackKeys = [
      [
        ...new Set([
          ...this.data[0].values[0].values.map(({ key }) => key),
          ...this.data[1].values[0].values.map(({ key }) => key),
        ]),
      ],
      [
        ...new Set([
          ...this.data[0].values[1].values.map(({ key }) => key),
          ...this.data[1].values[1].values.map(({ key }) => key),
        ]),
      ],
    ];

    this.data.forEach((d) => {
      d.values.forEach((e, i) => {
        e.values.sort((a, b) =>
          d3.ascending(stackKeys[i].indexOf(a.key), stackKeys[i].indexOf(b.key))
        );
        e.total = 0;
        e.values.forEach((g) => {
          g.stacked = [e.total, (e.total += g.value)];
        });
      });
      d.overEmitted = Math.max(0, d.values[1].total - d.values[0].total);
      d.penalty = d.overEmitted * penaltyMultiplier;
    });
  }

  setup() {
    this.unit = "tCO2e/yr";

    this.formatValue = new Intl.NumberFormat("en-US", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format;

    this.marginTop = 16;
    this.marginRight = 200;
    this.marginBottom = 48;
    this.marginLeft = 4;
    this.height = 500;
    this.barWidth = 96;
    this.barGap = 72;
    this.width =
      this.marginLeft + (this.barWidth + this.barGap) * 3 + this.marginRight;

    this.rx = 4;
    this.totalLineWidth = 6;

    this.x = d3
      .scaleBand()
      .domain([0, 1, 2])
      .range([this.marginLeft, this.width - this.marginRight])
      .paddingInner(this.barGap / (this.barGap + this.barWidth))
      .paddingOuter((this.barGap / (this.barGap + this.barWidth)) * 0.5)
      .align(1);

    this.y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(this.data, ({ values }) => d3.max(values, ({ total }) => total)),
      ])
      .range([this.height - this.marginBottom, this.marginTop]);
  }

  render() {
    this.renderSkeleton();
    this.renderGroups();
    this.renderComparison();
  }

  renderSkeleton() {
    d3.select(this.el).select(".cfc").on("mousemove", null).remove();

    this.container = d3
      .select(this.el)
      .append("div")
      .attr("class", "cfc")
      .on("mousemove", (event) => {
        if (event.target.closest(".stack-g")) {
          const d = d3.select(event.target.closest(".stack-g")).datum();
          if (this.tooltip.datum() !== d) {
            this.tooltip
              .datum(d)
              .html(
                (d) =>
                  `<div>${d.key}</div><div>${this.formatValue(d.value)}</div>`
              );
            this.showTooltip();
          }
          this.moveTooltip(event);
        } else if (event.target.closest(".comparison-g .total-g")) {
          const d = d3.select(event.target.closest(".total-g")).datum();
          if (this.tooltip.datum() !== d) {
            this.tooltip
              .datum(d)
              .html(
                (d) =>
                  `<div>${d.totalLabel}</div><div>${this.formatValue(
                    d.total
                  )}</div>`
              );
            this.showTooltip();
          }
          this.moveTooltip(event);
        } else {
          this.tooltip.datum(null);
          this.hideTooltip();
        }
      });

    this.svg = this.container
      .append("div")
      .attr("class", "inner-container")
      .selectAll("svg")
      .data(this.data, (d) => d.key)
      .join("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("viewBox", [0, 0, this.width, this.height]);

    this.tooltip = this.container.append("div").attr("class", "tip");
  }

  renderGroups() {
    const groupG = this.svg
      .selectAll(".group-g")
      .data(
        (d) => d.values,
        (d) => d.key
      )
      .join("g")
      .attr("class", "group-g")
      .attr("transform", (_, i) => `translate(${this.x(i)},0)`);

    const stackG = groupG
      .append("g")
      .selectAll(".stack-g")
      .data(
        (d) => d.values,
        (d) => d.key
      )
      .join("g")
      .attr("class", "stack-g");

    stackG
      .append("rect")
      .attr("class", "stack-rect")
      .attr("rx", 4)
      .attr("width", this.x.bandwidth())
      .attr("y", (d) => this.y(d.stacked[1]))
      .attr("height", (d) => this.y(d.stacked[0]) - this.y(d.stacked[1]));

    stackG
      .append("text")
      .attr("class", "stack-text")
      .attr("text-anchor", "middle")
      .attr("x", this.x.bandwidth() / 2)
      .attr("y", (d) => (this.y(d.stacked[0]) + this.y(d.stacked[1])) / 2)
      .text((d) => d.key)
      .call(this.wrap, this.x.bandwidth() - 8)
      .each((d, i, ns) => {
        const textHeight = ns[i].getBBox().height;
        const rectHeight = this.y(d.stacked[0]) - this.y(d.stacked[1]);
        if (textHeight >= rectHeight) d3.select(ns[i]).text("");
      });

    groupG
      .append("text")
      .attr("class", "group-text")
      .attr("text-anchor", "middle")
      .attr("x", this.x.bandwidth() / 2)
      .attr("y", this.height - this.marginBottom + 16)
      .text((d) => `${d.xLabel} (${this.unit})`)
      .call(this.wrap, this.x.bandwidth() + this.barGap / 2, 0.71, false);

    const totalG = groupG
      .append("g")
      .attr("class", "total-g")
      .attr("transform", (d) => `translate(0,${this.y(d.total)})`);

    totalG
      .append("line")
      .attr("class", (d) => `total-line ${d.key}`)
      .attr("stroke-width", this.totalLineWidth)
      .attr("x1", this.totalLineWidth / 2)
      .attr("x2", this.x.bandwidth() - this.totalLineWidth / 2);

    totalG
      .append("text")
      .attr("class", "total-text")
      .attr("text-anchor", "end")
      .attr("x", -8)
      .text((d) => `${d.totalLabel} (${this.unit})`)
      .call(this.wrap, this.barGap - 8);
  }

  renderComparison() {
    const comparisonG = this.svg
      .append("g")
      .attr("class", "comparison-g")
      .attr("transform", `translate(${this.x(2)},0)`);

    const totalG = comparisonG
      .selectAll(".total-g")
      .data(
        (d) => d.values,
        (d) => d.key
      )
      .join("g")
      .attr("class", "total-g")
      .attr("transform", (d) => `translate(0,${this.y(d.total)})`);

    totalG
      .append("line")
      .attr("class", (d) => `total-line ${d.key}`)
      .attr("stroke-width", this.totalLineWidth)
      .attr("x1", this.totalLineWidth / 2)
      .attr("x2", this.x.bandwidth() - this.totalLineWidth / 2);

    totalG
      .append("text")
      .attr("class", "total-text")
      .attr("text-anchor", "end")
      .attr("x", -8)
      .text((d) => `${d.totalLabel} (${this.unit})`)
      .call(this.wrap, this.barGap - 8 - 12);

    // Adjust total text to avoid overlap
    comparisonG.each((d, i, ns) => {
      const text = d3.select(ns[i]).selectAll(".total-g").select(".total-text");
      const minText =
        d.overEmitted > 0
          ? text.filter((_, i) => i === 0)
          : text.filter((_, i) => i === 1);
      const { height: minHeight } = minText.node().getBBox();
      const maxText =
        d.overEmitted > 0
          ? text.filter((_, i) => i === 1)
          : text.filter((_, i) => i === 0);
      const { height: maxHeight } = maxText.node().getBBox();
      const gap = Math.abs(
        this.y(d.values[0].total) - this.y(d.values[1].total)
      );
      const minGap = minHeight / 2 + maxHeight / 2 + 4;
      if (gap >= minGap) return;
      minText.attr("transform", `translate(0,${(minGap - gap) / 2})`);
      maxText.attr("transform", `translate(0,${-(minGap - gap) / 2})`);
    });

    const linkGap = 8;
    const linkWidth = 12;
    comparisonG
      .append("g")
      .attr("transform", `translate(${this.x.bandwidth() + linkGap},0)`)
      .selectAll(".link-path")
      .data(
        (d) => d.values,
        (d) => d.key
      )
      .join("path")
      .attr("class", "link-path")
      .attr("d", (d, i, ns) => {
        const p = d3.select(ns[i].parentNode).datum();
        const source = [0, this.y(d.total)];
        const target = [
          linkWidth,
          (this.y(p.values[0].total) + this.y(p.values[1].total)) / 2,
        ];
        return d3.link(d3.curveStep)({ source, target });
      });

    const comparisonTextWidth = this.marginRight - linkGap * 2 - linkWidth - 4;
    comparisonG
      .append("g")
      .attr(
        "transform",
        (d) =>
          `translate(${this.x.bandwidth() + linkGap * 2 + linkWidth},${
            (this.y(d.values[0].total) + this.y(d.values[1].total)) / 2
          })`
      )
      .selectAll(".comparison-text")
      .data((d) => [
        `over emitted carbon (${this.unit})`,
        `= ${this.formatValue(d.overEmitted)}`,
        ` `,
        `est penalty ($/yr)`,
        `= ${this.formatValue(d.penalty)}`,
      ])
      .join("text")
      .attr("class", "comparison-text")
      .attr("text-anchor", "start")
      .attr("x", 0)
      .attr("y", 0)
      .text((d) => d)
      .call(this.wrap, comparisonTextWidth, 0.35);

    // Adjust comparison text y

    comparisonG.each((_, i, ns) => {
      let y = 0;
      d3.select(ns[i])
        .selectAll(".comparison-text")
        .each((_, i, ns) => {
          d3.select(ns[i]).attr("transform", `translate(0,${y})`);
          const { height } = ns[i].getBBox();
          y += height || 4;
        });
    });
  }

  showTooltip() {
    this.tooltip.classed("visible", true);
    this.boundsRect = this.container.node().getBoundingClientRect();
    this.tooltipRect = this.tooltip.node().getBoundingClientRect();
  }

  moveTooltip(event) {
    const [mx, my] = d3.pointer(event, this.container.node());
    const offset = 8;
    let x, y;
    if (mx >= this.boundsRect.width / 2) {
      x = mx - this.tooltipRect.width - offset;
      if (x < 0) x = 0;
    } else {
      x = mx + offset;
      if (x + this.tooltipRect.width > this.boundsRect.width)
        x = this.boundsRect.width - this.tooltipRect.width;
    }
    if (my >= this.boundsRect.height / 2) {
      y = my - this.tooltipRect.height - offset;
      if (y < 0) y = 0;
    } else {
      y = my + offset;
      if (y + this.tooltipRect.height > this.boundsRect.height)
        y = this.boundsRect.height - this.tooltipRect.height;
    }
    this.tooltip.style("transform", `translate(${x}px,${y}px)`);
  }

  hideTooltip() {
    this.tooltip.classed("visible", false);
  }

  // Modified from https://observablehq.com/@jtrim-ons/svg-text-wrapping
  wrap(text, width, dyAdjust = 0.35, centreVertically = true) {
    const lineHeightEms = 1.2;
    const lineHeightSquishFactor = 1;
    const splitOnHyphen = true;

    text.each(function () {
      var text = d3.select(this),
        x = text.attr("x"),
        y = text.attr("y");

      var words = [];
      text
        .text()
        .split(/\s+/)
        .forEach(function (w) {
          if (splitOnHyphen) {
            var subWords = w.split("-");
            for (var i = 0; i < subWords.length - 1; i++)
              words.push(subWords[i] + "-");
            words.push(subWords[subWords.length - 1] + " ");
          } else {
            words.push(w + " ");
          }
        });

      text.text(null); // Empty the text element

      // `tspan` is the tspan element that is currently being added to
      var tspan = text.append("tspan");

      var line = ""; // The current value of the line
      var prevLine = ""; // The value of the line before the last word (or sub-word) was added
      var nWordsInLine = 0; // Number of words in the line
      for (var i = 0; i < words.length; i++) {
        var word = words[i];
        prevLine = line;
        line = line + word;
        ++nWordsInLine;
        tspan.text(line.trim());
        if (tspan.node().getComputedTextLength() > width && nWordsInLine > 1) {
          // The tspan is too long, and it contains more than one word.
          // Remove the last word and add it to a new tspan.
          tspan.text(prevLine.trim());
          prevLine = "";
          line = word;
          nWordsInLine = 1;
          tspan = text.append("tspan").text(word.trim());
        }
      }

      var tspans = text.selectAll("tspan");

      var h = lineHeightEms;
      // Reduce the line height a bit if there are more than 2 lines.
      if (tspans.size() > 2)
        for (var i = 0; i < tspans.size(); i++) h *= lineHeightSquishFactor;

      tspans.each(function (d, i) {
        // Calculate the y offset (dy) for each tspan so that the vertical centre
        // of the tspans roughly aligns with the text element's y position.
        var dy = i * h + dyAdjust;
        if (centreVertically) dy -= ((tspans.size() - 1) * h) / 2;
        d3.select(this)
          .attr("y", y)
          .attr("x", x)
          .attr("dy", dy + "em");
      });
    });
  }
}
