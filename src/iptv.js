/// <reference path="../assets/js/jquery-3.7.0.min.js" />

let channelList = [],
  typesLists,
  dataTable;

const initTable = (data) => {
  if (dataTable) {
    // Table is already initialised just update the data
    let currentPageNumber = dataTable.api().page();
    dataTable.fnClearTable();
    dataTable.fnAddData(data);
    dataTable.api().page(currentPageNumber).draw('page');
  } else {
    dataTable = $('#tv-list').dataTable({
      data,
      dom:
        '<"d-flex align-items-center">' +
        'rt' +
        '<"d-flex align-items-center flex-column flex-md-row gap-2"l<"d-flex align-items-center justify-content-center text-center flex-grow-1"i><""p>>',
      language: {
        infoFiltered: ' <br/> Filtered from _MAX_ total entries',
      },
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return data.channelName;
            },
          }),
          renderer: function (api, rowIdx, columns) {
            var data = $.map(columns, function (col, i) {
              return col.columnIndex !== 0
                ? '<tr data-dt-row="' +
                    col.rowIndex +
                    '" data-dt-column="' +
                    col.columnIndex +
                    '">' +
                    '<td>' +
                    col.title +
                    (col.title ? ': ' : '') +
                    '</td> ' +
                    '<td>' +
                    col.data +
                    '</td>' +
                    '</tr>'
                : '';
            }).join('');

            return data ? $('<table class="table col-details"/>').append(data) : false;
          },
        },
      },
      columns: [
        {data: 'channelName', title: 'Channel', className: ''},
        {data: 'providerName', title: 'Source', className: ''},
        {
          data: null,
          title: 'Actions',
          orderable: false,
          searchable: false,
          className: 'text-center align-middle hide-in-details actions-col',
          responsivePriority: 1,
          width: '20px',
          render: (data, type, row) =>
            `<div class="text-center"><a href="javascript:void(0)" onclick="generateVLC('${row.channelName}', '${row.url}')" data-bs-toggle="popover" data-bs-trigger="hover focus" data-bs-content="Play"><img class="table-action-image-small" src="./assets/images/vlc.png" /></a>
            <div>`,
        },
      ],
      order: [[0, 'asc']],
      pageLength: 50,
    });

    // This is a good place to put all jquery events because this part executes only once

    // Table search input event
    $('#table-search').on('keyup click', function () {
      searchTable($('#table-search').val());
      setSearchClear();
    });

    // Search clear button event
    $(`#search-clear`).on('click', (e) => {
      $(`#table-search`).val('');
      searchTable(null, true);
      setSearchClear();
    });
  }
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
  const popoverList = [...popoverTriggerList].map((popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl));
};

filterTable = (text) => {
  let isFilter = true;
  if ($(`#channels-stats #filter-${text}`).hasClass('btn-dark')) {
    isFilter = false;
    $(`#channels-stats .btn-dark`).removeClass('btn-dark');
  } else {
    $(`#channels-stats .btn-dark`).removeClass('btn-dark');
    $(`#channels-stats #filter-${text}`).addClass('btn-dark');
  }
  searchTable(null, true);
  if (text) {
    searchTable(text, !isFilter);
    $('#filter-clear').removeClass('d-none');
  } else {
    $('#filter-clear').addClass('d-none');
  }
};

generateVLC = async (name, url) => {
  const res = await callAPI('POST', './apis/generate-vlc-file.php', JSON.stringify({name, url}));
  if (res && res.success) {
    //download file
    var filename = `${name}.vlc`;

    // Create a temporary anchor element
    var link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([res.data], {type: 'application/octet-stream'})); // Create a URL for the blob response
    link.download = filename;

    // Append the anchor element to the document body
    document.body.appendChild(link);

    // Trigger the click event to start the download
    link.click();

    // Clean up resources
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
  } else {
    showToast(false, `Error while generating vlc file`);
  }
};

searchTable = (text, isClear) => {
  // Clear search
  if (isClear) {
    // Need to keep status filters if already applied
    let filterText = $(`#channels-stats #filter-online`).hasClass('btn-dark')
      ? 'online'
      : $(`#channels-stats #filter-disabled`).hasClass('btn-dark')
      ? 'disabled'
      : '';
    dataTable.api().search(filterText).draw();
  } else {
    // Search by text supplied also keep other filter
    let filterText = $(`#channels-stats #filter-online`).hasClass('btn-dark')
      ? 'online'
      : $(`#channels-stats #filter-disabled`).hasClass('btn-dark')
      ? 'disabled'
      : '';
    dataTable
      .api()
      .search(filterText + ' ' + text)
      .draw();
  }
};

setSearchClear = () => {
  if ($(`#table-search`).val()) {
    $('#search-clear').removeClass('d-none');
  } else {
    $('#search-clear').addClass('d-none');
  }
};

const fetchChannelList = async (isRefresh) => {
  if (!isRefresh) mainLoader(true);
  let res = await callAPI('GET', './apis/get-stream-list.php');
  if (res && res.data) initTable(res.data);
  if (!typesLists) {
    // Get channel types arrays
    resChannelTypes = await callAPI('GET', './apis/get-channel-types.php');
  }
  if (!typesLists) typesLists = resChannelTypes && resChannelTypes.data;
  if (roleId === 1 && resChannelTypes && resChannelTypes.data) {
    // Load the menu after types are loaded
    loadMenu();
  }
  mainLoader(false);
};

$(() => {
  // Loading channel list on init
  fetchChannelList();
});
