const GRID_ID = "gridjs";
const DATABASE_FILE = "/veracode-tags-test/database.txt";

const MAX_FILTER_CONDITIONS = 10;

const TOGGLE_CONTAINER = "dark-mode-toggle-container";
const INSTRUCTIONS_CONTAINER = "instructions-container";
const COOKIE_NOTICE = "cookie-notice";
const BUTTON_CONTAINER = "reset-filters-container";
const BUTTON = "button-reset-filters";

const INSTRUCTIONS_DETAILS = "instructions-details";
const COOKIE_NOTICE_DETAILS = "cookie-notice-details";

const DARK_MODE_COOKIE = "IsDarkMode";
const OPEN_INSTRUCTIONS_COOKIE = "IsOpenInstructions";
const OPEN_COOKIE_NOTICE_COOKIE = "IsOpenCookieNotice";

const DARK_SWITCH = "darkSwitch";

const DARK_MODE_GRID_CLASS = "ag-theme-quartz-dark";
const LIGHT_MODE_GRID_CLASS = "ag-theme-quartz";
const DARK_MODE_HEADERS_CLASS = "container-dark";
const LIGHT_MODE_HEADERS_CLASS = "container-light";
const DARK_MODE_BUTTON_CLASS = "btn btn-dark btn-sm";
const LIGHT_MODE_BUTTON_CLASS = "btn btn-light btn-sm";

var api = null;
var lastFilteredTag = ""

function getCookieByName(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop().split(';').shift() : "";
  }

function getIsDarkModeFromCookie() {
    return "true" === getCookieByName(DARK_MODE_COOKIE).toLowerCase();
}

function getIsInstructionsOpenFromCookie() {
    return "true" === getCookieByName(OPEN_INSTRUCTIONS_COOKIE).toLowerCase();
}

function getIsCookieNoticeOpenFromCookie() {
    return "true" === getCookieByName(OPEN_COOKIE_NOTICE_COOKIE).toLowerCase();
}

function setDarkMode(isDarkMode) {
    document.getElementById(TOGGLE_CONTAINER).classList.remove(isDarkMode ? LIGHT_MODE_HEADERS_CLASS : DARK_MODE_HEADERS_CLASS);
    document.getElementById(TOGGLE_CONTAINER).classList.add(isDarkMode ? DARK_MODE_HEADERS_CLASS : LIGHT_MODE_HEADERS_CLASS);

    document.getElementById(COOKIE_NOTICE).classList.remove(isDarkMode ? LIGHT_MODE_HEADERS_CLASS : DARK_MODE_HEADERS_CLASS);
    document.getElementById(COOKIE_NOTICE).classList.add(isDarkMode ? DARK_MODE_HEADERS_CLASS : LIGHT_MODE_HEADERS_CLASS);

    document.getElementById(INSTRUCTIONS_CONTAINER).classList.remove(isDarkMode ? LIGHT_MODE_HEADERS_CLASS : DARK_MODE_HEADERS_CLASS);
    document.getElementById(INSTRUCTIONS_CONTAINER).classList.add(isDarkMode ? DARK_MODE_HEADERS_CLASS : LIGHT_MODE_HEADERS_CLASS);

    document.getElementById(BUTTON_CONTAINER).classList.remove(isDarkMode ? LIGHT_MODE_HEADERS_CLASS : DARK_MODE_HEADERS_CLASS);
    document.getElementById(BUTTON_CONTAINER).classList.add(isDarkMode ? DARK_MODE_HEADERS_CLASS : LIGHT_MODE_HEADERS_CLASS);
    
    document.getElementById(BUTTON).setAttribute("class", isDarkMode ? DARK_MODE_BUTTON_CLASS : LIGHT_MODE_BUTTON_CLASS);
    document.getElementById(GRID_ID).setAttribute("class", isDarkMode ? DARK_MODE_GRID_CLASS : LIGHT_MODE_GRID_CLASS);
}

function getIsDarkModeToggled() {
    return document.getElementById(DARK_SWITCH).checked;
}

function setCookies(isDarkMode, isInstructionsOpen, isCookieNoticeOpen) {
    var expiration = new Date();
    expiration.setMonth(expiration.getMonth() + 12);
    document.cookie = DARK_MODE_COOKIE + "=" + isDarkMode + ";" + ";expires=" + expiration;
    document.cookie = OPEN_INSTRUCTIONS_COOKIE + "=" + isInstructionsOpen + ";expires=" + expiration;
    document.cookie = OPEN_COOKIE_NOTICE_COOKIE + "=" + isCookieNoticeOpen + ";expires=" + expiration;
}

function getIsInstructionsOpen() {
    let details = document.getElementById(INSTRUCTIONS_DETAILS);
    return details.open;
}

function getIsCookieNoticeOpen() {
    let details = document.getElementById(COOKIE_NOTICE_DETAILS);
    return details.open;
}

function toggleAllCookies() {
    setCookies(getIsDarkModeToggled(), getIsInstructionsOpen(), getIsCookieNoticeOpen())
}

function setDarkModeCookie(isDarkMode) {
    setCookies(isDarkMode, getIsInstructionsOpen(), getIsCookieNoticeOpen())
}

function toggleDarkMode() {
    var isDarkMode = getIsDarkModeToggled();
    setDarkMode(isDarkMode);
    setDarkModeCookie(isDarkMode);
}

function toggleAllCookies() {
    setAllCookies();
}

function loadCookieInformation() {
    isDarkMode = getIsDarkModeFromCookie();  
    document.getElementById(DARK_SWITCH).checked = isDarkMode;
    setDarkMode(isDarkMode);  

    document.getElementById(INSTRUCTIONS_DETAILS).open = getIsInstructionsOpenFromCookie();
    document.getElementById(COOKIE_NOTICE_DETAILS).open = getIsCookieNoticeOpenFromCookie();
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

function replaceAll(str, replacementMap){
    var regexExpression = new RegExp(Object.keys(replacementMap).join("|"),"gi");

    return str.replace(regexExpression, function(matched){
        return replacementMap[matched.toLowerCase()];
    });
}

function unescapeHTML(str) {
    return replaceAll(str, {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': '\\',
        '&#x2F;': '/', 
    });
}

function escapeHTML(str) {
    return replaceAll(str, {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\\': '&#39;',
        '/': '&#x2F;', 
    });
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


function trimAllLinksFromString(value) {
    if (value == null) {
        return value;
    }
    allNodes = value.split("</a>");
    if (allNodes.length == 1) {
        return allNodes[0];
    }
    newString = "";
    for (let index = 0; index < allNodes.length; index++) {
        node = allNodes[index];
        beforeLink = node.substring(0, node.indexOf("<"));
        afterLink = node.substring(node.indexOf(">")+1);
        newString += beforeLink + afterLink;
    }
    return newString;
}

function customComparator(valueA, valueB) {
    let toCompareA = trimAllLinksFromString(valueA);
    let toCompareB = trimAllLinksFromString(valueB);
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
                    maxNumConditions: MAX_FILTER_CONDITIONS,
                    textMatcher:  ({ filterOption, value, filterText }) => {
                        if (filterText == null) {
                            return true;
                        }
                        value = unescapeHTML(trimAllLinksFromString(value));
                        switch (filterOption) {
                            case 'contains':
                                return value.indexOf(filterText) >= 0;
                            case 'equals':
                                return value === filterText;
                            case 'startsWith':
                                return value.indexOf(filterText) === 0;
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
            onGridReady: function (evt) {
                api = evt.api;
                sortGrid(event, 'name', 'asc');
            },
        }
        agGrid.createGrid(document.getElementById(GRID_ID), gridOptions)
    });
    
}