/**
 * Name: Ashton Roxas
 * Date: 11/26/2025
 * File: script.js
 * GUI Assignment HW4 Part 2:
 * - Implements Validation Plugin.
 * - Implements jQuery UI Sliders (Two-way binding).
 * - Implements jQuery UI Tabs (Dynamic creation and deletion).

 */

const MIN_ALLOWED_VAL = -50;
const MAX_ALLOWED_VAL = 50;

$(document).ready(function() {
    
    // 1. Initialize Tabs [cite: 57]
    var tabs = $("#tabs").tabs();

    // 2. Initialize Sliders with Two-Way Binding [cite: 74, 78]
    // Helper function to setup slider <-> input binding
    function makeSlider(sliderId, inputId) {
        $(sliderId).slider({
            min: MIN_ALLOWED_VAL,
            max: MAX_ALLOWED_VAL,
            range: "min",
            value: 0, // Default value
            slide: function(event, ui) {
                // SLIDER -> INPUT
                // When slider moves, update input value immediately [cite: 76]
                $(inputId).val(ui.value);
                // Trigger validation to remove error messages if value becomes valid
                $(inputId).valid(); 
            }
        });

        // INPUT -> SLIDER
        // When input changes, update slider position 
        $(inputId).on("change keyup", function() {
            let val = parseInt($(this).val());
            // Only update slider if value is a valid number within range
            if (!isNaN(val) && val >= MIN_ALLOWED_VAL && val <= MAX_ALLOWED_VAL) {
                $(sliderId).slider("value", val);
            }
        });
    }

    // Create the 4 sliders
    makeSlider("#slider-colStart", "#colStart");
    makeSlider("#slider-colEnd", "#colEnd");
    makeSlider("#slider-rowStart", "#rowStart");
    makeSlider("#slider-rowEnd", "#rowEnd");

    // 3. Validation Logic (Preserved from Part 1) [cite: 18]
    $.validator.addMethod("greaterThanEqual", function(value, element, params) {
        const minElementValue = $(params).val();
        // Allow check only if both are numbers
        if (isNaN(value) || isNaN(minElementValue)) return true; 
        return Number(value) >= Number(minElementValue);
    }, function(params, element) {
        const label = $(element).closest('.input-row').find('label').text();
        const partnerLabel = $(params).closest('.input-row').find('label').text();
        return `🚫 ${label} must be >= ${partnerLabel}.`;
    });

    $("#rangeForm").validate({
        submitHandler: function(form) {
            // IF Valid: Create a new Tab with the table 
            addTab();
            return false;
        },
        rules: {
            colStart: { required: true, number: true, min: MIN_ALLOWED_VAL, max: MAX_ALLOWED_VAL },
            colEnd: { required: true, number: true, min: MIN_ALLOWED_VAL, max: MAX_ALLOWED_VAL, greaterThanEqual: "#colStart" },
            rowStart: { required: true, number: true, min: MIN_ALLOWED_VAL, max: MAX_ALLOWED_VAL },
            rowEnd: { required: true, number: true, min: MIN_ALLOWED_VAL, max: MAX_ALLOWED_VAL, greaterThanEqual: "#rowStart" }
        },
        messages: {
            // Keep your custom messages from Part 1 here (abbreviated for brevity)
            colStart: { min: `Min value is ${MIN_ALLOWED_VAL}`, max: `Max value is ${MAX_ALLOWED_VAL}` },
            colEnd: { min: `Min value is ${MIN_ALLOWED_VAL}`, max: `Max value is ${MAX_ALLOWED_VAL}` },
            rowStart: { min: `Min value is ${MIN_ALLOWED_VAL}`, max: `Max value is ${MAX_ALLOWED_VAL}` },
            rowEnd: { min: `Min value is ${MIN_ALLOWED_VAL}`, max: `Max value is ${MAX_ALLOWED_VAL}` }
        },
        errorPlacement: function(error, element) {
            error.appendTo(element.closest('.input-row').find('.error-container'));
        },
        highlight: function(element) {
            $(element).addClass("error");
            $(element).closest('.input-row').addClass('has-error');
        },
        unhighlight: function(element) {
            $(element).removeClass("error");
            $(element).closest('.input-row').removeClass('has-error');
        }
    });

    // 4. Tab Management Logic
    
    // Function to add a new tab 
    function addTab() {
        const cStart = Number($('#colStart').val());
        const cEnd = Number($('#colEnd').val());
        const rStart = Number($('#rowStart').val());
        const rEnd = Number($('#rowEnd').val());

        // Create Unique ID for the new tab
        const tabCount = $("#tabs ul li").length; 
        const tabId = "tabs-" + (tabCount + 1) + "-" + Date.now(); // Unique ID
        
        // Label the tab with parameters 
        const tabTitle = `[${cStart}, ${cEnd}] x [${rStart}, ${rEnd}]`;
        
        // Template for the Tab Header (includes close button) 
        const li = `<li><a href="#${tabId}">${tabTitle}</a> <span class="ui-icon ui-icon-close" role="presentation">Remove Tab</span></li>`;
        
        // Append Header and Content Div
        $("#tabs ul").append(li);
        $("#tabs").append(`<div id="${tabId}" class="table-scroll-area"></div>`);
        
        // Refresh jQuery UI Tabs to recognize new elements
        $("#tabs").tabs("refresh");

        // Generate the table HTML inside the new div
        const tableHTML = generateTableHTML(cStart, cEnd, rStart, rEnd);
        $("#" + tabId).html(tableHTML);

        // Switch to the newly created tab
        const newIndex = $("#tabs ul li").length - 1;
        $("#tabs").tabs("option", "active", newIndex);
    }

    // Function to close individual tabs 
    // Uses event delegation because these elements are dynamic
    $("#tabs").on("click", "span.ui-icon-close", function() {
        var panelId = $(this).closest("li").remove().attr("aria-controls");
        $("#" + panelId).remove();
        tabs.tabs("refresh");
    });

    // Function to Delete All Tabs (except the Main Input tab) [cite: 85, 99]
    $("#delete-all-btn").click(function() {
        // Remove all LIs except the first one
        $("#tabs ul li:not(:first-child)").remove();
        // Remove all DIV panels except tabs-1
        $("#tabs div[id^='tabs-']:not(#tabs-1)").remove();
        tabs.tabs("refresh");
    });
});

// Helper function to generate Table HTML string
function generateTableHTML(cStart, cEnd, rStart, rEnd) {
    // Safety Check for size
    if (Math.abs(cEnd - cStart) > 200 || Math.abs(rEnd - rStart) > 200) {
         return '<p class="error">Table too large to render.</p>';
    }

    let html = '<table>';
    // Header Row
    html += '<tr><th class="empty-cell"></th>';
    for (let c = cStart; c <= cEnd; c++) {
        html += `<th>${c}</th>`;
    }
    html += '</tr>';

    // Body Rows
    for (let r = rStart; r <= rEnd; r++) {
        html += '<tr>';
        html += `<th>${r}</th>`; // Row Header
        for (let c = cStart; c <= cEnd; c++) {
            html += `<td>${r * c}</td>`;
        }
        html += '</tr>';
    }
    html += '</table>';
    return html;
}