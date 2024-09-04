const GRID_ID = "gridjs";
const DATABASE_FILE = "/veracode-tags-test/database.txt";

const DARK_MODE_COOKIE = "IsDarkMode";
const DARK_MODE_GRID_CLASS = "ag-theme-quartz-dark";
const LIGHT_MODE_GRID_CLASS = "ag-theme-quartz";


var api = null;
var lastFilteredTag = ""

function getIsDarkModeFromCookie() {
    let decodedCookie = decodeURIComponent(document.cookie);
    if (!decodedCookie || decodedCookie.indexOf("=") <= 0) {
        return false;
    }
    return (decodedCookie.split(';')[0].split("=")[1]).toLowerCase() == "true";
}

function setDarkMode(isDarkMode) {
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
    document.getElementById("darkSwitch").checked = getIsDarkModeFromCookie();    
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

function renderCell(cell) {
    return cell.value;
}

async function triggerSearch(field, value, isAdditive) {
    newFilterModel = isAdditive ? await api.getColumnFilterModel(field) : [];
    if (!newFilterModel) {
        newFilterModel = [];
    }
    if (!Array.isArray(newFilterModel)) {
        newFilterModel = [newFilterModel];
    }
    newFilterModel.push({
        filterType: 'text',
        type: 'contains',
        filter: value,
        caseSensitive: false 
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
    api = event.api
    api.applyColumnState(columnState);
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
                filterOptions: ["contains", "equals", "startsWith"],
                filter: true,
                cellRenderer: renderCell, 
                flex: 1
            },
            columnDefs: [
                {  headerName: "Name", field: "name"},
                {  headerName: "Description", field: "description", flex: 4},
                {  headerName: "Author", field: "author" },
                {  headerName: "Tags", field: "tags" }
            ],
            rowData: gridData,
            pagination: true,
            paginationPageSize: 10,
            paginationPageSizeSelector: [5, 10, 25, 50, 100, items.length],
            domLayout: 'autoHeight',
            onGridReady: function (event) {
              sortGrid(event, 'name', 'asc')
            },
        }
        agGrid.createGrid(document.getElementById(GRID_ID), gridOptions)
    });
    
}