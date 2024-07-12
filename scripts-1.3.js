function searchSelection(cell, rowIndex, cellIndex) {
    var searchValue = $("input").val()
    if (searchValue == null || searchForValue == "") {
        return "";
    }
    searchValue = searchValue.trim().toLowerCase()
    if (searchValue.startsWith("name=")) {
        return cellIndex == 0 ? searchForValue(cell, searchValue) : "";
    } else if (searchValue.startsWith("url=")) {
        return cellIndex == 1 ? searchForValue(cell, searchValue) : "";
    } else if (searchValue.startsWith("description=")) {
        return cellIndex == 2 ? searchForValue(cell, searchValue) : "";
    } else if (searchValue.startsWith("author=")) {
        return cellIndex == 3 ? searchForValue(cell, searchValue) : "";
    } else if (searchValue.startsWith("tags=")) {
        return cellIndex == 5 ? searchForValue(cell, searchValue) : "";
    }
    return cell == null ? "" : cell;
}

function triggerSearch(value) {
    var inputField = document.querySelector('.gridjs-search-input');
    inputField.value = "tags=" + value;

    inputField.dispatchEvent(new Event('input', {
        bubbles: true,
        cancelable: true,
    }));
}

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
    var description = data.cells[2].data;
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

function populateGrid(grid_id) {
    var items = []
    $.get("/veracode-tags-test/database.txt", function(data) {
        items = data.split("\n");
        items.shift();
        while (items[items.length-1] === '') {
            items.pop();
        }
        items = items.map(function(element) { 
            var newLine = element.split("\t");
            newLine.push("");
            newLine.push("");
            newLine.push("");
            newLine.push("");
            return newLine;
        });					
        new gridjs.Grid({
            search: {
                ignoreHiddenColumns: false,
                selector: (cell, rowIndex, cellIndex) => searchSelection(cell, rowIndex, cellIndex)
            },
            sort: true,
            pagination: true,
            columns: [{
                name: 'repo-name',
                hidden: true
            },
            {
                name: 'repo-url',
                hidden: true
            },
            {
                name: 'repo-description',
                hidden: true
            },
            {
                name: 'author-name',
                hidden: true
            },
            {
                name: 'author-url',
                hidden: true
            },
            {
                name: 'repo-tags',
                hidden: true
            },
            { 
                name: 'Name',
                formatter: (_, row) => gridjs.html(`${buildLinkHtml(row.cells[0].data, row.cells[1].data)}`)
            },
            { 
                name: 'Description',
                formatter: (_, row) => gridjs.html(`${buildDescriptionHtml(row)}`)
            },
            { 
                name: 'Author',
                formatter: (_, row) => gridjs.html(`${buildLinkHtml(row.cells[4].data, row.cells[3].data)}`)
            },
            { 
                name: 'Tags',
                formatter: (_, row) => {
                    elements = (row == null || row.cells[5] == null || row.cells[5].data == null) ? [] : row.cells[5].data.split(",")
                    html = ''
                    elements.forEach((element) => {
                        var trimmed = element.trim()
                        if (html) {
                            html += ', '
                        }
                        html += "<a href=\"#\" onclick=\"triggerSearch('" + escapeHTML(trimmed) + "')\">" + escapeHTML(trimmed) + "</a>"
                    });
                    return gridjs.html(`${html}`)	
                }								
            }],			        
            data: items
        }).render(document.getElementById(grid_id));
    });
}