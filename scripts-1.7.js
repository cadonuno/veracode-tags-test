const GRID_ID = "gridjs";
const DATABASE_FILE = "/veracode-tags-test/database.txt";

const MAX_FILTER_CONDITIONS = 10;

const TOGGLE_CONTAINER = "dark-mode-toggle-container"
const INSTRUCTIONS_CONTAINER = "instructions-container"
const BUTTON_CONTAINER = "reset-filters-container"
const BUTTON = "button-reset-filters"

const DARK_MODE_COOKIE = "IsDarkMode";

const DARK_MODE_GRID_CLASS = "ag-theme-quartz-dark";
const LIGHT_MODE_GRID_CLASS = "ag-theme-quartz";
const DARK_MODE_HEADERS_CLASS = "container-dark";
const LIGHT_MODE_HEADERS_CLASS = "container-light";
const DARK_MODE_BUTTON_CLASS = "btn btn-dark btn-sm";
const LIGHT_MODE_BUTTON_CLASS = "btn btn-light btn-sm";


var api = null;
var lastFilteredTag = ""

function getIsDarkModeFromCookie() {
    let decodedCookie = decodeURIComponent(document.cookie);
    if (!decodedCookie || !decodedCookie.includes("=")) {
        return false;
    }
    return (decodedCookie.split(';')[0].split("=")[1]).toLowerCase() == "true";
}

function setDarkMode(isDarkMode) {
    document.getElementById(TOGGLE_CONTAINER).classList.remove(isDarkMode ? LIGHT_MODE_HEADERS_CLASS : DARK_MODE_HEADERS_CLASS);
    document.getElementById(TOGGLE_CONTAINER).classList.add(isDarkMode ? DARK_MODE_HEADERS_CLASS : LIGHT_MODE_HEADERS_CLASS);

    document.getElementById(INSTRUCTIONS_CONTAINER).classList.remove(isDarkMode ? LIGHT_MODE_HEADERS_CLASS : DARK_MODE_HEADERS_CLASS);
    document.getElementById(INSTRUCTIONS_CONTAINER).classList.add(isDarkMode ? DARK_MODE_HEADERS_CLASS : LIGHT_MODE_HEADERS_CLASS);

    document.getElementById(BUTTON_CONTAINER).classList.remove(isDarkMode ? LIGHT_MODE_HEADERS_CLASS : DARK_MODE_HEADERS_CLASS);
    document.getElementById(BUTTON_CONTAINER).classList.add(isDarkMode ? DARK_MODE_HEADERS_CLASS : LIGHT_MODE_HEADERS_CLASS);

    document.getElementById(BUTTON).setAttribute("class", isDarkMode ? DARK_MODE_BUTTON_CLASS : LIGHT_MODE_BUTTON_CLASS);
    document.getElementById(GRID_ID).setAttribute("class", isDarkMode ? DARK_MODE_GRID_CLASS : LIGHT_MODE_GRID_CLASS);
}

function setDarkModeCookie(isDarkMode) {
    var expiration = new Date();
    expiration.setMonth(expiration.getMonth() + 12);
    document.cookie = DARK_MODE_COOKIE + "=" + isDarkMode + ";expires=" + expiration;
}

function toggleDarkMode() {
    var isDarkMode = document.getElementById("darkSwitch").checked
    setDarkMode(isDarkMode);
    setDarkModeCookie(isDarkMode);
}

function loadDarkMode() {
    isDarkMode = getIsDarkModeFromCookie();  
    document.getElementById("darkSwitch").checked = isDarkMode;
    setDarkMode(isDarkMode);  
}

async function resetFilters() {
    await api.setFilterModel(null);
    api.onFilterChanged();
}

function buildLinkHtml(linkUrl, linkDescription) {
    return "<a target='_blank' href='" + linkUrl + "'>" + linkDescription + "</a>";
}

function buildDescriptionHtml(data) {
    var description = data[1];
    if (description == null) {
        return "";
    }
    if (!description.includes("[")) {
        return description;
    }						
    var splitDescription = description.split("[");
    var newDescription = splitDescription[0];
    var currentLinkIndex = 1;
    while (currentLinkIndex < splitDescription.length) {
        linkTagEndSplit = splitDescription[currentLinkIndex].split("]")
        linkTagUrlAndDescriptionSplit = linkTagEndSplit[0].split("|")
        newDescription+=buildLinkHtml(linkTagUrlAndDescriptionSplit[1], linkTagUrlAndDescriptionSplit[0]) + linkTagEndSplit[1];
        currentLinkIndex++;
    }

    return newDescription;
}

function getIsAdditiveForTags(value) {
    if (lastFilteredTag !== value) {
        lastFilteredTag = value;
        return true;
    } else {
        lastFilteredTag = "";
        return false;
    }    
}

function escapeHTML(str) {
    return str.replace(/[&<>"'\/]/g, (char) => {
        switch (char) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            case '\\':
                return '&#39;';
            case '/':
                return '&#x2F;';
            default:
                return char;
            }
        });
}

function filterForElement(filterOption, value, filterText) {
    if (filterText == null) {
        return false;
    }
    escapedFilterText = unescapeHTML(filterText);
    escapedValue = unescapeHTML(value);
    switch (filterOption) {
        case 'contains':
            return escapedValue.indexOf(escapedFilterText) >= 0;
        case 'equals':
            return escapedValue === escapedFilterText;
        case 'startsWith':
            return escapedValue.indexOf(escapedFilterText) === 0;
        default:
            // should never happen
            console.warn('invalid filter type ' + filterOption);
            return false;
    }
}

function renderCell(cell) {
    return cell.value;
}

async function triggerSearch(field, value, isAdditive) {
    newFilterModel = isAdditive ? await api.getColumnFilterModel(field) : null;
    if (!newFilterModel) {
        newFilterModel = {
            filterType: 'text',
            operator: 'AND',
            conditions: []
        };
    } else if (!newFilterModel.conditions) {
        newFilterModel = {
            filterType: 'text',
            operator: 'AND',
            conditions: [newFilterModel]
        };
    }
    if (newFilterModel.conditions.length == MAX_FILTER_CONDITIONS) {
        newFilterModel.conditions.shift();
    }
    newFilterModel.conditions.push({
        filterType: 'text',
        type: 'contains',
        filter: value
    });
    await api.setColumnFilterModel(field, newFilterModel);
    api.onFilterChanged();
}

async function triggerTagSearch(value) {
    triggerSearch("tags", value, getIsAdditiveForTags(value));
}

function buildTagsHtml(tagsField) {
    elements = (tagsField == null) ? [] : tagsField.split(",");
    html = '';
    elements.forEach((element) => {
        var trimmed = element.trim();
        if (html) {
            html += ', ';
        }
        html += "<a href=\"#\" onclick=\"triggerSearch('tags', '" + escapeHTML(trimmed) + "', true)\">" + escapeHTML(trimmed) + "</a>";
    });
    return html;
}

function sortGrid(event, field, sortDir) {
    const columnState = {
      state: [
        {
          colId: field,
          sort: sortDir
        }
      ]
    }
    api.applyColumnState(columnState);
  }

function trimLinkFromString(value) {
    if (value == null) {
        return value;
    }
    value = escapeHTML(value);
    let endOfLink = value.indexOf(">");
    return endOfLink > 0 ? value.substring(endOfLink) : value;
}

function customComparator(valueA, valueB) {
    let toCompareA = trimLinkFromString(valueA);
    let toCompareB = trimLinkFromString(valueB);
    return toCompareA.toLowerCase().localeCompare(toCompareB.toLowerCase());
}

function populateGrid() {
    var items = []
    
    $.get(DATABASE_FILE, function(data) {
        items = data.split("\n");
        items.shift();
        while (items[items.length-1] === '') {
            items.pop();
        }
        gridData = items.map(function(element) { 
            var newLine = element.split("\t");
            return {
                "name": buildLinkHtml(newLine[4], newLine[0]),
                "description": buildDescriptionHtml(newLine),
                "author": buildLinkHtml(newLine[5], newLine[2]),
                "tags": buildTagsHtml(newLine[3]),
            };
        });
        var gridOptions = {
            defaultColDef: {
                filterParams: {
                    filterOptions: ["contains", "equals", "startsWith"],
                    textFormatter: trimLinkFromString,
                    maxNumConditions: MAX_FILTER_CONDITIONS,
                    textMatcher:  ({ filterOption, value, filterText }) => {
                        if (filterText == null) {
                            return false;
                        }
                        filterText = escapeHTML(filterText);
                        value = trimLinkFromString(escapeHTML(value))
                        switch (filterOption) {
                            case 'contains':
                                return value.indexOf(filterText) >= 0;
                            case 'notContains':
                                return value.indexOf(filterText) < 0;
                            case 'equals':
                                return value === filterText;
                            case 'notEqual':
                                return value != filterText;
                            case 'startsWith':
                                return value.indexOf(filterText) === 0;
                            case 'endsWith':
                                const index = value.lastIndexOf(filterText);
                                return index >= 0 && index === (value.length - filterText.length);
                            default:
                                // should never happen
                                console.warn('invalid filter type ' + filter);
                                return false;
                        }
                    }
                },
                filter: true,
                cellRenderer: renderCell,
                comparator: customComparator, 
                flex: 1,
            },
            columnDefs: [
                {  headerName: "Name", field: "name", wrapText: true},
                {  headerName: "Description", field: "description", wrapText: true, autoHeight: true, flex: 4 },
                {  headerName: "Author", field: "author" },
                {  headerName: "Tags", field: "tags", wrapText: true, autoHeight: true }
            ],
            rowData: gridData,
            pagination: true,
            paginationPageSize: 10,
            paginationPageSizeSelector: [5, 10, 25, 50, 100, items.length],
            domLayout: 'autoHeight',
            onGridReady: function (event) {
                api = event.api;
                sortGrid(event, 'name', 'asc');
            },
        }
        agGrid.createGrid(document.getElementById(GRID_ID), gridOptions)
    });
    
}