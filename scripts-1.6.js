const GRID_ID = "gridjs";
const DATABASE_FILE = "/veracode-tags-test/database.txt";

function searchForValue(cell, searchValue) {
    if (cell == null) {
        return "";
    }
    var searchValueLower = searchValue.split('=')[1].toLowerCase();
    var toCompare = cell.toLowerCase();
    var searchValueList = searchValueLower.split(",");
    var searchIndex = 0;
    while (searchIndex < searchValueList.length) {
        if (!toCompare.includes(searchValueList[searchIndex].trim())) {
            return "";
        }
        searchIndex++;
    }
    return searchValue;
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

async function triggerSearch(field, value) {
    await api.setColumnFilterModel(field, {
        filterType: 'customFilter',
        type: 'contains',
        filter: value,
     });

     api.onFilterChanged();
}

async function triggerTagSearch(value) {
    triggerSearch("tags", value);
}

function buildTagsHtml(tagsField) {
    elements = (tagsField == null) ? [] : tagsField.split(",");
    html = '';
    elements.forEach((element) => {
        var trimmed = element.trim();
        if (html) {
            html += ', ';
        }
        html += "<a href=\"#\" onclick=\"triggerTagSearch('" + escapeHTML(trimmed) + "')\">" + escapeHTML(trimmed) + "</a>";
    });
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
                {  headerName: "Name", field: "name", filter: true, flex: 2, cellRenderer: renderCell },
                {  headerName: "Description", field: "description", filter: true, flex: 3, cellRenderer: renderCell },
                {  headerName: "Author", field: "author", filter: true, flex: 1, cellRenderer: renderCell },
                {  headerName: "Tags", field: "tags", filter: true, flex: 1 }
            ],
            rowData: gridData,
            pagination: true
        }
        agGrid.createGrid(document.getElementById(GRID_ID), gridOptions)
    });
    
}