/// <reference path="../assets/js/jquery-3.7.0.min.js" />

let channelList = [],
  channelHiboxList = [],
  iptvProvidersList = [],
  formValidator,
  selectedChannel,
  dataTable,
  typesLists,
  isChannelExist,
  originalNumber,
  selectedConfirmItem,
  selectedConfirmAction,
  channelDBList,
  pageRefreshTimeout,
  selectedDeleteItem,
  deleteConfirmModalCount = 0,
  deleteModalElm,
  resetForm,
  resetFormStep = 1,
  hiboxBaseURL;

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
        {data: 'id', title: 'ID', className: 'align-middle', visible: false, searchable: false},
        {
          data: 'name',
          title: '',
          className: 'align-middle',
          orderable: false,
          width: '100px',
          render: (data, type, row) =>
            `<div class="text-center">${row.logo ? `<img src="./assets/images/logos/${row.logo}" class="channel-logo" />` : ''}<div>`,
        },
        {
          data: 'channelName',
          title: 'Channel',
          className: 'align-middle all',
          render: (data, type, row) =>
            `<div><div> ${row.name}</div>${`<div>${row.channelName}</div>`}${
              roleId === 1 && row.hibox && !row.hiboxSynced
                ? `<div><span class="text-danger fst-italic">Hibox name: ${row.hibox.name}</span>&nbsp;&nbsp;<a class="me-3" href="javascript:void(0)" onclick="toggleConfirmModal('sync', ${row.id})" data-bs-toggle="popover" data-bs-trigger="hover" data-bs-placement="top" data-bs-content="Sync in Hibox"><i class="fa-solid fa-arrows-rotate"></i></a><div>`
                : ''
            }${roleId === 1 && row.hiboxNotFound ? `<div><span class="text-danger fst-italic">Not found in Hibox</span><div>` : ''}<div>`,
        },
        {
          data: 'typeSource',
          title: 'Source',
          className: 'align-middle',
          width: '50px',
          render: (data, type, row) =>
            row.typeSource
              ? `<div><div> ${row.typeSource}</div>${
                  row.iptvProviders && roleId === 1
                    ? row.iptvProviders
                        .map(
                          (item, index) =>
                            `<div><a href="javascript:void(0)" onclick="copyToClipboard('${
                              item.url
                            }', this)" data-bs-toggle="popover" data-bs-trigger="hover" data-bs-content="Copy" data-bs-placement="top"><u>URL ${
                              index + 1
                            }</u></a>: <span>${item.provider}</span> ${
                              item.active ? `<span class="text-success"><i class="fa-solid fa-circle"></i></span>` : ''
                            }${
                              item.skypeId === '1'
                                ? `<a class="text-primary" href="javascript:void(0)" onclick="openSkype('${
                                    item.url
                                  }', this)" data-bs-toggle="popover" data-bs-trigger="hover" data-bs-content="Open Skype" data-bs-placement="top" style="font-size:14px;margin-top:1px;position:relative;${
                                    item.active ? 'margin-left:5px;' : ''
                                  }"><i class="fa-brands fa-skype" style="position:absolute;top:1px;"></i></a>`
                                : ''
                            }`,
                        )
                        .join('')
                    : ''
                }<div>`
              : '',
        },
        {data: 'typeOTT', title: 'OTT', className: 'text-center align-middle', visible: roleId == 1},
        {data: 'ip', title: 'IP', className: 'text-center align-middle', width: '46px', visible: roleId == 1},
        {
          data: 'typePVI',
          title: 'PVI',
          render: (data, type, row) =>
            row.typePVI ? `<div><div> ${row.typePVI}</div>${row.pviPort ? `<div><u>Port</u>: ${row.pviPort}</div>` : ''}<div>` : '',
          className: 'align-middle',
          visible: roleId == 1,
        },
        {
          data: 'typePDU',
          title: 'PDU',
          width: '35px',
          render: (data, type, row) =>
            `<div><div> ${row.typePDU || ''}</div>${row.pduPort ? `<div><u>Port</u>: ${row.pduPort}</div>` : ''}<div>`,
          className: 'align-middle',
        },
        {
          data: 'cardNumber',
          title: 'Info',
          render: (data, type, row) =>
            `<div>${row.box ? `<div><u>Box</u>: ${row.box} <u>Rack</u>: ${row.rack}</div>` : ''}${
              row.cardNumber ? `<div><u>Card Number</u>: ${row.cardNumber.replace('|', '</br>')}</div>` : ''
            }${row.cardNumberExpiry ? `<div><u>Expiry</u>: ${moment(row.cardNumberExpiry).format('DD MMMM YYYY')}</div>` : ''}<div>`,
          className: 'align-middle',
          visible: roleId == 1,
        },
        {
          data: 'typeEscalation',
          title: 'Escalation',
          className: 'text-center align-middle',
          width: '62px',
          render: (data, type, row) =>
            `<div><div> ${row.typeEscalation || ''}</div>${
              row.wikiUrl ? `<div><a href="${row.wikiUrl}" target="_blank">Wiki</a></div>` : ''
            }<div>`,
        },
        {
          data: 'priority',
          title: 'Priority',
          className: 'text-center align-middle',
          width: '44px',
          render: (data, type, row) =>
            `<div class="text-center" style="font-size:13px; color:#404040;">${
              parseInt(row.priority)
                ? `<i class="fa-solid fa-square-check"></i>`
                : `<input style="margin-top:6px;" type="checkbox" disabled>`
            }<div>`,
        },
        {
          data: 'enabled',
          title: 'Enabled',
          className: 'text-center align-middle',
          width: '49px',
          render: (data, type, row) =>
            `<div class="text-center" style="font-size:13px; color:#404040;">${
              parseInt(row.enabled)
                ? `<i class="fa-solid fa-square-check"></i>`
                : `<input style="margin-top:6px;" type="checkbox" disabled>`
            }<div>`,
          visible: roleId == 1,
        },
        {
          data: null,
          title: 'OTT Status',
          className: 'text-center align-middle all',
          render: (data, type, row) =>
            row.flusonicStatus !== undefined
              ? `<div class="text-center"><div class="${
                  row.flusonicStatus == 'Online' ? 'text-success' : row.flusonicStatus == 'Disabled' ? 'text-secondary' : 'text-danger'
                }"><i class="fa-solid fa-circle"></i> ${row.flusonicStatus}</div>${
                  row.flusonicUptime ? `<div class="text-secondary text-right" style="font-size:0.8rem">${row.flusonicUptime}</div>` : ''
                }${
                  row.flusonicStatusError
                    ? `<div class="text-danger text-right" style="font-size:0.8rem">${row.flusonicStatusError}</div>`
                    : ''
                }<div>`
              : `<div class="text-secondary">${row.flusonicNotFound ? 'Not Found' : ''}</div>`,
        },
        {
          data: 'typeEscalation',
          title: 'Actions',
          orderable: false,
          searchable: false,
          className: 'text-center align-middle hide-in-details actions-col',
          responsivePriority: 1,
          width: '63px',
          render: (data, type, row) =>
            `<div class="text-center">
            ${
              row.flusonicBlackoutFound
                ? `<a style="text-decoration: initial;" class="me-2" href="javascript:void(0)" onclick="toggleConfirmModal('blackout', ${
                    row.id
                  })" data-bs-toggle="popover" data-bs-placement="top" data-bs-trigger="hover" data-bs-content="${
                    row.flusonicBlackoutEnabled ? 'Disable' : 'Enable'
                  } blackout">${
                    row.flusonicBlackoutEnabled
                      ? `<img class="table-action-image" src="./assets/images/laliga.png" />`
                      : `<i class="fa-solid fa-tv"></i></a>`
                  }`
                : ''
            }
            ${
              !row.disabled
                ? `<a class="me-2" href="javascript:void(0)" onclick="toggleConfirmModal('restart', ${row.id})" data-bs-toggle="popover" data-bs-trigger="hover" data-bs-placement="top" data-bs-content="Restart"><i class="fa-solid fa-arrows-rotate"></i></a>`
                : ''
            }
            ${
              roleId === 1
                ? `<a href="javascript:void(0)" onclick="toggleEditModal(${row.id})" data-bs-toggle="popover" data-bs-placement="top" data-bs-trigger="hover" data-bs-content="Edit"><i class="fa-solid fa-pen"></i></a>`
                : ''
            }
            ${
              row.flusonicStatus && roleId === 1
                ? `<a class="ms-2" href="${row.flusonicUrl}/admin/#/streams/${row.name}" target="_blank" data-bs-toggle="popover" data-bs-trigger="hover" data-bs-placement="top" data-bs-content="Edit on Flusonic"><img class="table-action-image-small" src="./assets/images/flusonic.webp" /></a>`
                : ''
            }
            ${
              row.hibox && roleId === 1
                ? `<a class="ms-2" href="${hiboxBaseURL}/hiboxadmin/ChannelAdmin?action=edit&channel_id=${row.hibox.id}" target="_blank" data-bs-toggle="popover" data-bs-trigger="hover" data-bs-placement="top" data-bs-content="Edit on Hibox"><img class="table-action-image-small" src="./assets/images/hibox.png" /></a>`
                : ''
            }
            ${
              roleId === 1
                ? `<a class="ms-2" href="javascript:void(0)" onclick="toggleDeleteModal(${row.id}, true)" data-bs-toggle="popover" data-bs-trigger="hover" data-bs-placement="top" data-bs-content="Delete"><i class="fa-solid fa-trash"></i></a>`
                : ''
            }
            <div>`,
        },
      ],
      order: [[2, 'asc']],
      pageLength: 50,
    });

    // This is a good place to put all jquery events because this part executes only once

    // Table search input event
    $('#table-search').on('keyup click', function () {
      searchTable($('#table-search').val());
      setSearchClear();
    });

    // Add channel button event
    $('#add-channel').on('click', () => {
      toggleEditModal();
    });

    // wiki url input event
    $(`#edit-form #input_wikiUrl`).on('keyup', (e) => {
      setWikiPreviewUrl();
    });

    // Search clear button event
    $(`#search-clear`).on('click', (e) => {
      $(`#table-search`).val('');
      searchTable(null, true);
      setSearchClear();
    });

    // Set current year for footer
    $('.current-year').html(moment().format('YYYY'));

    // channel number input event to validate if it already exist
    setupOnStopTypeEvent('#edit-form #input_name', validateChannelNumber);
    // channel name input event to show info alert
    setupOnStopTypeEvent('#edit-form #input_channelName', validateChannelName);
  }
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
  const popoverList = [...popoverTriggerList].map((popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl));
};

const copyToClipboard = (text, elem) => {
  copyClipboard(text.replace('tshttp', 'http'));
  showToast(true, 'URL copied');
};

const openSkype = (text, elem) => {
  window.location = 'skype:?chat';
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

toggleInputError = (isShow, selector, error) => {
  if (isShow) {
    $(selector).addClass('has-error border border-danger');
    $(`${selector}_error`).html(error);
  } else {
    $(selector).removeClass('has-error border border-danger');
    $(`${selector}_error`).html('');
  }
};

const validateChannelNumber = async () => {
  let body = {
    number: $('#edit-form #input_name').val(),
  };
  if (body.number && body.number !== originalNumber) {
    const res = await callAPI('POST', './apis/validate-channel-number.php', JSON.stringify(body));
    if (res && res.success && res.data.exist) {
      isChannelExist = res.data && res.data.exist;
      toggleInputError(true, '#input_name', res.message || 'This number already exist');
    } else {
      isChannelExist = false;
      toggleInputError(false, '#input_name');
    }
  } else {
    isChannelExist = false;
    toggleInputError(false, '#input_name');
  }
  validateChannelName();
};

const validateChannelName = async () => {
  if (
    selectedChannel.id &&
    selectedChannel.hibox &&
    ($('#edit-form #input_channelName').val() !== selectedChannel.channelName || $('#edit-form #input_name').val() !== selectedChannel.name)
  ) {
    showInPageAlert('edit-alert', 'warning', 'Note: The channel will be synchronized in Hibox.');
  } else {
    showInPageAlert('edit-alert', 'warning', null);
  }
};

setSearchClear = () => {
  if ($(`#table-search`).val()) {
    $('#search-clear').removeClass('d-none');
  } else {
    $('#search-clear').addClass('d-none');
  }
};

const initDatePicker = (id) => {
  $(id).flatpickr({dateFormat: 'd/m/Y'});
};

const calculateUptime = (startDate, isDiff) => {
  let timeDifference = 0;
  if (isDiff) {
    timeDifference = startDate;
  } else {
    const currentDate = new Date();
    timeDifference = currentDate.getTime() - startDate;
  }

  let seconds = moment.duration(timeDifference).seconds();
  let minutes = moment.duration(timeDifference).minutes();
  let hours = moment.duration(timeDifference).hours();
  let days = moment.duration(timeDifference).days();

  // Construct the uptime string
  let uptimeString = '',
    strCount = 0;
  if (days > 0) {
    strCount++;
    uptimeString += days + 'd';
  }
  if (hours > 0) {
    strCount++;
    uptimeString += ' ' + hours + 'h';
  }
  // Maximum two places allowed so only append if strCount <= 1 for both minutes and seconds
  if (minutes > 0 && strCount <= 1) {
    strCount++;
    uptimeString += ' ' + minutes + 'm';
  }
  if (seconds > 0 && strCount <= 1) {
    uptimeString += ' ' + seconds + 's';
  }

  return uptimeString;
};

const initChannelForm = () => {
  Object.keys(typesLists).forEach((key) => {
    let inputKey = '';
    if (key === 'typesSource') inputKey = 'typeSourceId';
    if (key === 'typesOTT') inputKey = 'typeOTTId';
    if (key === 'typesPVI') inputKey = 'typePVIId';
    if (key === 'typesPDU') inputKey = 'typePDUId';
    if (key === 'typesEscalation') inputKey = 'typeEscalationId';
    $(`#edit-form #input_${inputKey}`).html('');
    $(`#edit-form #input_${inputKey}`).append($('<option></option>').attr('value', '').text('Select an option'));
    typesLists[key].forEach((item) => {
      if (item.visible === undefined || parseFloat(item.visible)) {
        $(`#edit-form #input_${inputKey}`).append(
          $('<option></option>')
            .attr('value', item.id)
            .text(key !== 'typesOTT' ? item.description : `${item.description}${item.url ? ` (${item.url.replace('http://', '')})` : ''}`),
        );
      }
    });
  });
  $('#edit-form #logo_clear').on('click', () => {
    $('#edit-form #input_logo').attr('src', './assets/images/logos/no-logo.png');
    $('#edit-form #input_logo_input').val('');
    $('#edit-form #logo_clear').addClass('d-none');
  });
};

const fetchChannelList = async (isRefresh) => {
  if (!isRefresh) mainLoader(true);
  let res;
  if (!isRefresh) {
    res = await callAPI('GET', './apis/get-channel-list.php');
    let resIPTV = await callAPI('GET', './apis/get-iptv-providers.php');
    if (resIPTV && resIPTV.success) iptvProvidersList = resIPTV.data.map((item) => ({...item, urlPattern: item.urlPattern.split(',')}));
    if (roleId === 1) {
      let resHibox = await callAPI('GET', './apis/get-hibox-channel-list.php');
      if (resHibox && resHibox.success) {
        channelHiboxList = resHibox.data.channels;
        hiboxBaseURL = resHibox.data.url;
      }
    }
  } else {
    // Refresh action so mock the API response
    res = {success: true, data: channelDBList};
  }
  if (res && res.success) {
    channelDBList = res.data; // We will use this later if refresh only
    let resChannelTypes;
    // if (roleId === 2) {
    //   // mock type list becuase this role does not need it
    //   typesLists = {};
    // }
    // Only load types first time no need load again on next refresh
    if (!typesLists) {
      // Get channel types arrays
      resChannelTypes = await callAPI('GET', './apis/get-channel-types.php');
    }
    if (typesLists || (resChannelTypes && resChannelTypes.success)) {
      if (!typesLists) typesLists = resChannelTypes && resChannelTypes.data;
      if (resChannelTypes && resChannelTypes.data) {
        // Load the menu after types are loaded
        loadMenu();
      }

      let fluSonicList = [];
      // Gather list of flusonic sources that needs to be loaded
      // Step-1 Get unique items by typeOTTId
      const uniqueOTTIds = [...new Set(res.data.map((item) => item.typeOTTId))];

      // Step-2 Call all flusonic apis
      for (const ottId of uniqueOTTIds) {
        let foundFlusonicType = typesLists.typesOTT.find((item) => parseFloat(item.id) === parseFloat(ottId));
        if (foundFlusonicType && foundFlusonicType.url) {
          let body = {
            url: foundFlusonicType.url,
            user: foundFlusonicType.user,
            password: foundFlusonicType.password,
          };
          const resFluSonic = await callAPI('POST', './apis/load_external_list.php', JSON.stringify(body));
          if (resFluSonic && resFluSonic.success && resFluSonic.data && resFluSonic.data.streams) {
            fluSonicList = [...fluSonicList, ...resFluSonic.data.streams.map((item) => ({...item, ...body}))];
          }
        }
      }

      let channelStatsCount = {online: 0, disabled: 0, error: 0, delay: 0};

      let finalArray = res.data.map((item) => {
        let finalItem = {...item};

        // Find hibox channel
        let foundHiboxChannel = channelHiboxList.find((itemHibox) => itemHibox.number === parseFloat(item.name));
        if (foundHiboxChannel) {
          finalItem = {
            ...finalItem,
            hiboxSynced: item.channelName === foundHiboxChannel.name,
            hibox: {
              ...foundHiboxChannel,
            },
          };
        } else {
          finalItem = {
            ...finalItem,
            hiboxNotFound: true,
          };
        }
        // Find and get disabled and uptime by comparing name field
        let foundSonicChannel = fluSonicList.find(
          (itemFluSonic) => itemFluSonic.name === item.name && itemFluSonic.url === item.flusonicUrl,
        );
        if (foundSonicChannel) {
          let blackoutFound = foundSonicChannel.config_on_disk.inputs.find((item) => item.url.includes('blackout/'));
          if (foundSonicChannel.disabled) channelStatsCount.disabled += 1;
          else if (foundSonicChannel.stats.status === 'running') channelStatsCount.online += 1;
          else channelStatsCount.error += 1;
          let flusonicInputs = foundSonicChannel.inputs.map((item) => ({
            active: (item.stats && item.stats.active) || false,
            url: item.url,
            priority: item.priority,
          }));

          // Error string for source timeout and delay. Add more here if you want
          let flusonicStatusError = '';
          // Source error
          if (foundSonicChannel.stats.source_error) flusonicStatusError += foundSonicChannel.stats.source_error + ', ';
          // Delay
          if (
            foundSonicChannel.stats.ts_delay &&
            foundSonicChannel.stats.ts_delay > 1000 * 60 && // We only show delay if more than 1 min
            calculateUptime(foundSonicChannel.stats.ts_delay, true)
          ) {
            channelStatsCount.delay += 1;
            flusonicStatusError += `${calculateUptime(foundSonicChannel.stats.ts_delay, true)} delay, `;
          }
          // Remove last comma from error string
          if (flusonicStatusError) flusonicStatusError = flusonicStatusError.slice(0, -2);

          finalItem = {
            ...finalItem,
            flusonicStatus: foundSonicChannel.disabled ? 'Disabled' : foundSonicChannel.stats.status === 'running' ? 'Online' : 'Error',
            flusonicStatusError: flusonicStatusError || undefined,
            flusonicUptime: calculateUptime(foundSonicChannel.stats.opened_at),
            flusonicInputs: flusonicInputs,
            iptvProviders: flusonicInputs.reduce((iptvArray, inputItem) => {
              // See if any iptv provider's url match in input url and get the provider to show in UI
              let foundIPTVProvider = iptvProvidersList.find((iptv) => {
                // urlPattern is an array which was split by , so we need another find
                return iptv.urlPattern.find((urlItem) => inputItem.url.includes(urlItem));
              });
              if (foundIPTVProvider) {
                iptvArray.push({...inputItem, provider: foundIPTVProvider.description, skypeId: foundIPTVProvider.skypeId});
              }
              return iptvArray;
            }, []),
            flusonicBlackoutFound: blackoutFound,
            flusonicBlackoutEnabled: blackoutFound && blackoutFound.priority === 0 ? true : false,
            // flusonicUrl: foundSonicChannel.url,
            flusonicUser: foundSonicChannel.user,
            flusonicPassword: foundSonicChannel.password,
          };
        } else {
          finalItem = {...finalItem, flusonicNotFound: item.flusonicUrl ? true : false};
        }
        return finalItem;
      });
      channelList = finalArray;
      mainLoader(false);
      initTable(finalArray);
      initChannelForm();

      // Set channel stats
      $('#channels-stats #channels-online').html(`Online (${channelStatsCount.online})`);
      $('#channels-stats #channels-disabled').html(`Disabled (${channelStatsCount.disabled})`);
      $('#channels-stats #channels-error').html(`Error (${channelStatsCount.error})`);
      $('#channels-stats #channels-delay').html(`Delay (${channelStatsCount.delay})`);
      if (channelStatsCount.delay > 0) {
        // Change navbar color if there are channels with delay
        $('#navbar').removeClass('bg-dark');
        $('#navbar').addClass('bg-flusonic');
      } else {
        $('#navbar').removeClass('bg-flusonic');
        $('#navbar').addClass('bg-dark');
      }
      if ($('#channels-stats').hasClass('d-none')) $('#channels-stats').removeClass('d-none');

      // Setup refresh function
      if (!pageRefreshTimeout) {
        pageRefreshTimeout = setInterval(() => fetchChannelList(true), 5 * 60 * 1000);
      }
    }
  }
};

const readImageURL = (input) => {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      $('#edit-form #input_logo').attr('src', e.target.result);
      $('#edit-form #logo_clear').removeClass('d-none');
    };

    reader.readAsDataURL(input.files[0]);
  }
};

const setWikiPreviewUrl = () => {
  if ($(`#edit-form #input_wikiUrl`).val()) {
    $('#wiki-href').attr('href', $(`#edit-form #input_wikiUrl`).val());
    $('#wiki-href').removeClass('d-none');
  } else {
    $('#wiki-href').addClass('d-none');
  }
};

const setChannelForm = (selectedChannel, key) => {
  if (
    key === 'typeSourceId' ||
    key === 'input_typeOTTId' ||
    key === 'input_typePVIId' ||
    key === 'input_typePDUId' ||
    key === 'input_typeEscalationId'
  ) {
    $(`#edit-form #input_${key}`).val(selectedChannel[key]);
  }
  if (key === 'enabled' || key === 'priority') {
    // Setting all text inputs
    $(`#edit-form #input_${key}`).prop('checked', parseInt(selectedChannel[key]) ? true : false);
  }
  if (key === 'cardNumberExpiry' && selectedChannel[key]) {
    $(`#edit-form #input_${key}`).val(selectedChannel[key] ? moment(selectedChannel[key]).format('D/M/YYYY') : '');
  } else if (key === 'logo') {
    // Setting all text inputs
    $(`#edit-form #input_${key}`).attr(
      'src',
      selectedChannel[key] ? `./assets/images/logos/${selectedChannel[key]}` : './assets/images/logos/no-logo.png',
    );
    if (selectedChannel[key]) $('#logo_clear').removeClass('d-none');
    else $('#logo_clear').addClass('d-none');
    $('#edit-form #input_logo_input').val('');
    $('#edit-form #input_logo_input').on('change', function () {
      readImageURL(this);
    });
  } else if (key === 'wikiUrl') {
    $(`#edit-form #input_${key}`).val(selectedChannel[key]);
    setWikiPreviewUrl();
  } else {
    // Setting all text inputs
    $(`#edit-form #input_${key}`).val(selectedChannel[key]);
  }
};

const toggleEditModal = (id) => {
  $('#form-title').html((id ? 'Edit' : 'Add') + ' Channel');
  toggleButtonLoader('#channel-submit-button', false);
  showInPageAlert('edit-alert', 'warning', null);
  if (id) {
    selectedChannel = channelList.find((item) => id === parseFloat(item.id));
    Object.keys(selectedChannel).forEach((key) => {
      setChannelForm(selectedChannel, key);
    });
  } else {
    let emptyChannel = getEmptyChannel();
    selectedChannel = emptyChannel;
    Object.keys(emptyChannel).forEach((key) => {
      setChannelForm(emptyChannel, key);
    });
  }
  // Reset channel name validation flag
  isChannelExist = false;
  originalNumber = $('#input_name').val();
  toggleInputError(false, '#input_name');

  formValidator.resetForm();
  const myModalAlternative = new bootstrap.Modal('#edit-modal', {keyboard: false});
  myModalAlternative.toggle();
  initDatePicker('#input_cardNumberExpiry');
};

const toggleConfirmModal = (action, id) => {
  toggleButtonLoader('#confirm-submit', false);
  let confirmModalElm = $('#confirm-modal .modal-body');
  selectedConfirmItem = channelList.find((item) => id === parseFloat(item.id));
  selectedConfirmAction = action;
  $('#confirm-submit').removeClass((index, className) => (className.match(/(^|\s)btn-\S+/g) || []).join(' '));
  if (action === 'restart') {
    $('#confirm-submit').addClass('btn-success');
  } else {
    $('#confirm-submit').addClass('btn-dark');
  }
  if (action === 'blackout')
    confirmModalElm.html(
      `<div>Are you sure you want to <b class="fw-bold">${
        selectedConfirmItem.flusonicBlackoutEnabled ? 'disable' : 'enable'
      }</b> the ${action} for the following channel?</div><div><b class="fw-bold">${selectedConfirmItem.name} - ${
        selectedConfirmItem.channelName
      }</b></div>`,
    );
  else if (action === 'sync')
    confirmModalElm.html(
      `<div>Are you sure you want to <b class="fw-bold">sync</b> the following channel in <b class="fw-bold">Hibox</b>?</div><div><b class="fw-bold">${selectedConfirmItem.name} - ${selectedConfirmItem.channelName}</b></div>`,
    );
  else
    confirmModalElm.html(
      `<div>Are you sure you want to <b class="fw-bold">${action}</b> the following channel?</div><div><b class="fw-bold">${selectedConfirmItem.name} - ${selectedConfirmItem.channelName}</b></div>`,
    );
  const myModalAlternative = new bootstrap.Modal('#confirm-modal', {keyboard: false});
  myModalAlternative.toggle();
};

const submitChannelAction = async () => {
  if (selectedConfirmItem) {
    toggleButtonLoader('#confirm-submit', true);
    let res;
    if (selectedConfirmAction === 'sync') {
      let body = {
        ...selectedConfirmItem.hibox,
        name: selectedConfirmItem.channelName,
      };

      // Call API
      res = await callAPI('POST', './apis/update-hibox-channel.php', JSON.stringify(body));
    } else {
      let body = {
        url: selectedConfirmItem.flusonicUrl,
        user: selectedConfirmItem.flusonicUser,
        password: selectedConfirmItem.flusonicPassword,
        action: selectedConfirmAction,
        number: selectedConfirmItem.name,
        channelName: selectedConfirmItem.channelName,
      };

      // Attach body for blackout action
      if (selectedConfirmAction === 'blackout') {
        body.body = {
          inputs: [
            ...selectedConfirmItem.flusonicInputs.map((item, index) => {
              if (item.url.includes('blackout/')) body.blackoutEnabled = item.priority === undefined || item.priority === 10 ? true : false;
              return {
                url: item.url,
                priority: item.url.includes('blackout/')
                  ? item.priority === undefined || item.priority === 10
                    ? 0
                    : 10
                  : item.priority !== undefined
                  ? item.priority
                  : index + 1,
              };
            }),
          ],
        };
      }

      // Call API
      res = await callAPI('POST', './apis/call_external_api.php', JSON.stringify(body));
    }

    if (res && res.success) {
      showToast(true, res.message);
      $('#confirm-modal').modal('hide');
      $('.dtr-bs-modal').modal('hide');
      fetchChannelList(selectedConfirmAction !== 'sync');
    } else {
      showToast(false, (res && res.message) || `Error while ${selectedConfirmAction}ing channel`);
    }
    toggleButtonLoader('#confirm-submit', false);
  } else {
    showToast(false, `Channel is not seleted for this action`);
  }
};

const toggleDeleteModal = (id, isReset) => {
  if (isReset) {
    deleteConfirmModalCount = 0;
  }
  if (id) {
    toggleButtonLoader('#confirm-delete-modal', false);
    let confirmModalElm = $('#confirm-delete-modal .modal-body');
    selectedDeleteItem = channelList.find((item) => parseFloat(id) === parseFloat(item.id));
    confirmModalElm.html(
      `<div>Are you sure you want to <b class="fw-bold">delete</b> the following channel?</div><div><b class="fw-bold">${selectedDeleteItem.name} - ${selectedDeleteItem.channelName}</b></div>`,
    );
    if (!deleteModalElm) deleteModalElm = new bootstrap.Modal('#confirm-delete-modal', {keyboard: false});
    deleteModalElm.toggle();
    deleteConfirmModalCount++;
    $('#confirm-delete-modal .confirmation-count').html(deleteConfirmModalCount);
    if (deleteConfirmModalCount === 2) $('#confirm-delete-modal .confirm-button-text').html('Delete');
    else $('#confirm-delete-modal .confirm-button-text').html('Confirm');
  }
};

const deleteChannel = async () => {
  if (selectedDeleteItem) {
    if (deleteConfirmModalCount < 2) {
      deleteModalElm.toggle();
      setTimeout(() => {
        toggleDeleteModal(selectedDeleteItem.id);
      }, 500);
      return;
    }
    toggleButtonLoader('#confirm-delete-submit', true);
    let body = {
      id: selectedDeleteItem.id,
      name: selectedDeleteItem.name,
      channelName: selectedDeleteItem.channelName,
    };

    // Call API
    const res = await callAPI('POST', './apis/delete-channel.php', JSON.stringify(body));
    if (res && res.success) {
      showToast(true, res.message);
      $('#confirm-delete-modal').modal('hide');
      $('.dtr-bs-modal').modal('hide');
      fetchChannelList();
    } else {
      showToast(false, (res && res.message) || `Error while deleting channel`);
    }
    toggleButtonLoader('#confirm-delete-submit', false);
  } else {
    showToast(false, `Channel is not seleted for this action`);
  }
};

const getEmptyChannel = () => {
  return {
    id: null,
    name: null,
    channelName: null,
    typeSourceId: null,
    typeOTTId: null,
    ip: null,
    typePVIId: null,
    pviPort: null,
    typePDUId: null,
    pduPort: null,
    box: null,
    rack: null,
    cardNumber: null,
    cardNumberExpiry: null,
    typeEscalationId: null,
    priority: null,
    enabled: null,
    wikiUrl: null,
    logo: null,
  };
};

const findObjectDifference = (obj1, obj2) => {
  return Object.keys(obj1).filter((k) => {
    if (obj1[k] === null) obj1[k] = '';
    if (obj2[k] === null) obj2[k] = '';
    // if (!isNaN(parseFloat(obj1[k]))) obj1[k] = parseFloat(obj1[k]);
    // if (!isNaN(parseFloat(obj2[k]))) obj2[k] = parseFloat(obj2[k]);
    return obj1[k] !== obj2[k];
  });
};

const submitEditForm = async () => {
  toggleButtonLoader('#channel-submit-button', true);
  let body = getEmptyChannel();

  //Getting new values from form
  Object.keys(body).forEach((key) => {
    if (key === 'enabled' || key === 'priority') {
      body[key] = $(`#edit-form #input_${key}`).is(':checked') ? 1 : 0;
    } else if (key === 'cardNumberExpiry') {
      body[key] = $(`#edit-form #input_${key}`).val() ? moment($(`#edit-form #input_${key}`).val(), 'D-M-YYYY').format('YYYY-M-D') : '';
    } else if (key === 'id') {
      body[key] = $(`#edit-form #input_${key}`).val() ? parseFloat($(`#edit-form #input_${key}`).val()) : undefined;
    } else if (key === 'logo') {
      body[key] = $(`#input_${key}`).attr('src').split('/')[$(`#input_${key}`).attr('src').split('/').length - 1];
    } else {
      body[key] = $(`#edit-form #input_${key}`).val();
    }
  });

  if (body.name && body.channelName && !isChannelExist) {
    var fileInput = $('#input_logo_input');
    var selectedFile = fileInput[0].files[0];
    if (selectedFile) {
      console.log('Selected file:', selectedFile);
      var formData = new FormData();
      formData.append('image', selectedFile);
      const resImage = await callAPI('POST', './apis/channel-logo-upload.php', formData);
      if (resImage && resImage.success) {
        body.logo = resImage.data;
      }
    } else {
      console.log('No file selected.');
    }

    let oldChannel = {};
    Object.keys(body).map((key) => {
      oldChannel[key] = selectedChannel[key];
    });
    let difference = findObjectDifference(oldChannel, body);
    let finalBody = {
      id: body.id,
      name: selectedChannel.name,
      channelName: selectedChannel.channelName,
      hibox: selectedChannel.hibox,
      oldValues: selectedChannel,
      newValues: {
        id: body.id,
      },
    };
    difference.forEach((key) => {
      if (key === 'typeEscalationId')
        finalBody.newValues['typeEscalation'] = body.typeEscalationId
          ? typesLists.typesEscalation.find((item) => parseFloat(item.id) === parseFloat(body.typeEscalationId)).description
          : '';
      if (key === 'typeOTTId')
        finalBody.newValues['typeOTT'] = body.typeOTTId
          ? typesLists.typesOTT.find((item) => parseFloat(item.id) === parseFloat(body.typeOTTId)).description
          : '';
      if (key === 'typePDUId')
        finalBody.newValues['typePDU'] = body.typePDUId
          ? typesLists.typesPDU.find((item) => parseFloat(item.id) === parseFloat(body.typePDUId)).description
          : '';
      if (key === 'typePVIId')
        finalBody.newValues['typePVI'] = body.typePDUId
          ? typesLists.typesPVI.find((item) => parseFloat(item.id) === parseFloat(body.typePDUId)).description
          : '';
      if (key === 'typeSourceId')
        finalBody.newValues['typeSource'] = body.typeSourceId
          ? typesLists.typesSource.find((item) => parseFloat(item.id) === parseFloat(body.typeSourceId)).description
          : '';
      finalBody.newValues[key] = body[key];
    });
    // console.log('finalBody', finalBody);
    // Call API
    const res = await callAPI('POST', './apis/add-update-channel.php', JSON.stringify(finalBody));
    if (res && res.success) {
      showToast(true, res.message);
      $('#edit-modal').modal('hide');
      $('.dtr-bs-modal').modal('hide');
      fetchChannelList();
    } else {
      showToast(false, (res && res.message) || 'Error while updating channel');
    }
  }
  toggleButtonLoader('#channel-submit-button', false);
};

const submitLoginForm = async () => {
  // toggleButtonLoader('#login-submit-button', true);
  let body = {
    username: $(`#username`).val(),
    password: $(`#password`).val(),
  };

  if (body.username && body.password) {
    // Call API
    const res = await callAPI('POST', './apis/login.php', JSON.stringify(body));
    if (res && res.success) {
      showToast(true, res.message);
      location.reload();
    } else {
      showToast(false, (res && res.message) || 'Error while loggin in');
    }
  }
  // toggleButtonLoader('#login-submit-button', false);
};

const toggleResetForm = () => {
  resetForm.resetForm();
  resetFormStep = 1;
  // Flip main containers
  $('#login-form').toggleClass('d-none');
  $('#reset-form').toggleClass('d-none');

  // Reenable email if it is disabled
  $('#reset-email').attr('disabled', false);

  // Hide alerts if it is visible
  $('#reset-code-section').addClass('d-none');
  $('#reset-alert').addClass('d-none');

  // Clear form
  $('#reset-email').val('');
  $('#reset-code').val('');
  $('#reset-password').val('');
  $('#reset-confirm-password').val('');
  $('#reset-submit-text').html('Send');
};

const submitResetForm = async (e) => {
  e.preventDefault();
  if ($('#reset-form').valid()) {
    toggleButtonLoader('#reset-submit-button', true);
    $('#reset-alert').addClass('d-none');
    let body = {
      email: $('#reset-email').val(),
      code: resetFormStep === 2 ? $('#reset-code').val() : undefined,
      password: resetFormStep === 2 ? $('#reset-password').val() : undefined,
    };
    const res = await callAPI('POST', `./apis/forgot-password-${resetFormStep === 2 ? 'two' : 'one'}.php`, JSON.stringify(body));
    if (res && res.success) {
      // turn on step 2
      if (resetFormStep === 1) {
        $('#reset-email').attr('disabled', true);
        $('#reset-code-section').toggleClass('d-none');
        $('#reset-submit-text').html('Confirm');
      }
      resetFormStep = 2;
      setTimeout(() => {
        showInPageAlert('reset-alert', 'success', res.message);
      }, 300);
    } else {
      setTimeout(() => {
        showInPageAlert('reset-alert', 'danger', res.message);
      }, 300);
    }
    toggleButtonLoader('#reset-submit-button', false);
  }
};

$(() => {
  if (userId) {
    // Loading channel list on init
    fetchChannelList();

    // Form submit of add/edit channel
    $('#edit-form').on('submit', (e) => {
      e.preventDefault();
      submitEditForm(this);
    });

    // form validation init
    formValidator = $('#edit-form').validate({
      errorClass: 'd-none',
      highlight: function (element) {
        $(element).addClass('border border-danger');
      },
      unhighlight: function (element) {
        $(element).removeClass('border border-danger');
      },
    });

    // var x = document.getElementById('myTopnav');
    // if (x.className === 'topnav') {
    //   x.className += ' responsive';
    // } else {
    //   x.className = 'topnav';
    // }

    // Show/hide add channel based on role
    if (roleId === 1) {
      $('#add-channel').removeClass('d-none');
    } else {
      $('#add-channel').remove();
    }
  } else {
    // Form submit of login form
    $('#login-form').on('submit', (e) => {
      e.preventDefault();
      submitLoginForm();
    });
    // form validation init
    $('#login-form').validate({
      errorClass: 'd-none',
      highlight: function (element) {
        $(element).addClass('border border-danger');
      },
      unhighlight: function (element) {
        $(element).removeClass('border border-danger');
      },
    });
    // form validation init
    resetForm = $('#reset-form').validate({
      rules: {
        ['reset-confirm-password']: {
          equalTo: '#reset-password',
        },
      },
      errorClass: 'd-none',
      highlight: function (element) {
        $(element).addClass('border border-danger');
      },
      unhighlight: function (element) {
        $(element).removeClass('border border-danger');
      },
    });
  }
});
