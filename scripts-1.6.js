const GRID_ID = "gridjs";
const DATABASE_FILE = "/veracode-tags-test/database.txt";

var api = null;
var lastFilteredTag = ""

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
    baseFilterModel = isAdditive ? await api.getColumnFilterModel(field) : [];
    if (!baseFilterModel) {
        baseFilterModel = [];
    }
    await api.setColumnFilterModel(field, baseFilterModel.push({
        filterType: 'string',
        type: 'equals',
        filter: value,
        caseSensitive: false 
     }));

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
            columnDefs: [
                {  headerName: "Name", field: "name", filter: true, flex: 1, cellRenderer: renderCell },
                {  headerName: "Description", field: "description", filter: true, flex: 4, cellRenderer: renderCell },
                {  headerName: "Author", field: "author", filter: true, flex: 1, cellRenderer: renderCell },
                {  headerName: "Tags", field: "tags", filter: true, flex: 1, cellRenderer: renderCell }
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