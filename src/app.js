/// <reference path="../assets/js/jquery-3.7.0.min.js" />

let channelList = [],
  formValidator,
  selectedChannel,
  dataTable,
  typesLists,
  isChannelExist,
  originalNumber,
  selectedConfirmItem,
  selectedConfirmAction,
  channelDBList,
  pageRefreshTimeout;
const callAPI = (type, url, data) =>
  new Promise((resolve, reject) => {
    $.ajax({
      method: type,
      url,
      data,
      processData: false,
      contentType: false,
    })
      .then((res) => {
        if (res && res.success !== undefined) resolve({...res});
        else resolve({success: true, data: res});
      })
      .catch((e) => {
        resolve({success: false, data: e});
      });
  });

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
        '<"d-flex align-items-center"l<"d-flex align-items-center justify-content-center footer-entries"i><"flex-grow-1"p>>',
      // buttons: [
      //   {
      //     className: 'btn btn-sm btn-dark ms-2',
      //     text: 'Add Channel',
      //     action: function (e, dt, node, config) {
      //       // $('#myTable').DataTable().ajax.reload();
      //     },
      //     titleAttr: 'Add Channel',
      //   },
      // ],
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
        {data: 'id', title: 'ID', className: 'align-middle', visible: false},
        {
          data: 'name',
          title: '',
          className: 'align-middle',
          orderable: false,
          render: (data, type, row) =>
            `<div class="text-center">${row.logo ? `<img src="./assets/images/logos/${row.logo}" class="channel-logo" />` : ''}<div>`,
        },
        {
          data: 'channelName',
          title: 'Channel',
          className: 'align-middle',
          render: (data, type, row) => `<div><div> ${row.name}</div>${`<div>${row.channelName}</div>`}<div>`,
        },
        {data: 'typeSource', title: 'Source', className: 'text-center align-middle', width: '42px'},
        {data: 'typeOTT', title: 'OTT', className: 'text-center align-middle'},
        {data: 'ip', title: 'IP', className: 'text-center align-middle', width: '46px'},
        {
          data: 'typePVI',
          title: 'PVI',
          render: (data, type, row) =>
            row.typePVI ? `<div><div> ${row.typePVI}</div>${row.pviPort ? `<div><u>Port</u>: ${row.pviPort}</div>` : ''}<div>` : '',
          className: 'align-middle',
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
              row.cardNumber ? `<div><u>Card Number</u>: ${row.cardNumber}</div>` : ''
            }${row.cardNumberExpiry ? `<div><u>Expiry</u>: ${moment(row.cardNumberExpiry).format('DD MMMM YYYY')}</div>` : ''}<div>`,
          className: 'align-middle',
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
            `<div class="text-center">${
              parseInt(row.priority) ? `<input type="checkbox" checked disabled>` : `<input type="checkbox" disabled>`
            }<div>`,
        },
        {
          data: 'enabled',
          title: 'Enabled',
          className: 'text-center align-middle',
          width: '49px',
          render: (data, type, row) =>
            `<div class="text-center">${
              parseInt(row.enabled) ? `<input type="checkbox" checked disabled>` : `<input type="checkbox" disabled>`
            }<div>`,
        },
        {
          data: null,
          title: 'OTT Status',
          className: 'text-center align-middle all',
          render: (data, type, row) =>
            row.flusonicDisabled !== undefined
              ? `<div class="text-center"><div class="${
                  !row.flusonicDisabled ? 'text-success' : 'text-secondary'
                }"><i class="fa-solid fa-circle"></i> ${row.flusonicDisabled ? 'Disabled' : 'Online'}</div>${
                  row.flusonicUptime ? `<div class="text-secondary text-right" style="font-size:0.8rem">${row.flusonicUptime}</div>` : ''
                }<div>`
              : `<div class="text-secondary">${row.flusonicNotFound ? 'Not Found' : ''}</div>`,
        },
        {
          data: 'typeEscalation',
          title: 'Actions',
          orderable: false,
          searchable: false,
          className: 'text-center align-middle hide-in-details actions-col all',
          width: '63px',
          render: (data, type, row) =>
            `<div class="text-center">
            ${
              row.flusonicBlackoutFound
                ? `<a style="text-decoration: initial;" class="me-2" href="javascript:void(0)" onclick="toggleConfirmModal('blackout', ${
                    row.id
                  })" data-bs-toggle="popover" data-bs-trigger="hover focus" data-bs-content="${
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
                ? `<a class="me-2" href="javascript:void(0)" onclick="toggleConfirmModal('restart', ${row.id})" data-bs-toggle="popover" data-bs-trigger="hover focus" data-bs-content="Restart"><i class="fa-solid fa-arrows-rotate"></i></a>`
                : ''
            }
            ${
              roleId === 1
                ? `<a href="javascript:void(0)" onclick="toggleEditModal(${row.id})" data-bs-toggle="popover" data-bs-trigger="hover focus" data-bs-content="Edit"><i class="fa-solid fa-pen"></i></a>`
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
      dataTable.api().search($('#table-search').val()).draw();
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
      dataTable.api().search('').draw();
      setSearchClear();
    });

    // Set current year for footer
    $('.current-year').html(moment().format('YYYY'));

    // channel number input event to validate if it already exist
    setupOnStopTypeEvent('#edit-form #input_name', validateChannelName);
  }
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
  const popoverList = [...popoverTriggerList].map((popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl));
};

setupOnStopTypeEvent = (selector, event) => {
  let typingTimer,
    doneTypingInterval = 500;
  //on keyup, start the countdown
  $(selector).on('keyup', function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(event, doneTypingInterval);
  });

  //on keydown, clear the countdown
  $(selector).on('keydown', function () {
    clearTimeout(typingTimer);
  });
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

validateChannelName = async () => {
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

const calculateUptime = (startDate) => {
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - startDate;

  // Calculate days, hours, and minutes
  const millisecondsPerSecond = 1000 * 1;
  const millisecondsPerMinute = 1000 * 60;
  const millisecondsPerHour = millisecondsPerMinute * 60;
  const millisecondsPerDay = millisecondsPerHour * 24;

  const days = Math.floor(timeDifference / millisecondsPerDay);
  const hours = Math.floor((timeDifference % millisecondsPerDay) / millisecondsPerHour);
  const minutes = Math.floor((timeDifference % millisecondsPerHour) / millisecondsPerMinute);
  const seconds = Math.floor((timeDifference % millisecondsPerMinute) / millisecondsPerSecond);

  // Construct the uptime string
  let uptimeString = '';
  if (days > 0) {
    uptimeString += days + 'd';
  }
  if (hours > 0) {
    uptimeString += ' ' + hours + 'h';
  }
  if (minutes > 0 && hours <= 0) {
    uptimeString += ' ' + minutes + 'm';
  }
  if (seconds > 0 && hours <= 0 && minutes <= 0) {
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
};

const loadMenu = async () => {
  const res = await callAPI('GET', './apis/get-dynamic-menu.php');
  if (res && res.success) {
    let finalMenu = [];
    res.data.forEach((item) => {
      if (item.parentId) {
        // find parent by id and push to it
        let parentIndex = finalMenu.findIndex((itemParent) => parseFloat(itemParent.id) === parseFloat(item.parentId));
        if (!finalMenu[parentIndex].child) finalMenu[parentIndex].child = [];
        finalMenu[parentIndex].child.push(item);
      } else if (item.childsTable) {
        let childTable = JSON.parse(item.childsTable);
        // Get child items from typesLists object
        let finalItem = {...item};
        finalItem.child = childTable.type
          ? typesLists[childTable.table].filter((typ) => parseFloat(typ.type) === childTable.type)
          : typesLists[childTable.table];
        finalMenu.push(finalItem);
      } else {
        finalMenu.push(item);
      }
    });
    // Render menu in UI
    finalMenu.forEach((item) => {
      let menuHTML = '';
      if (item.child) {
        menuHTML = `<div class="dropdown">
            <button class="dropbtn">${item.description}
                <i class="fa fa-caret-down"></i>
            </button>
            <div class="dropdown-content">
                ${item.child.map((chld) => `<a target="_blank" href=${chld.url || 'javascript:void(0)'}>${chld.description}</a>`).join('')}
            </div>
        </div>`;
      } else {
        menuHTML = `<a target="_blank" href="${item.url || 'javascript:void(0)'}">${item.description}</a>`;
      }
      $('#main-menu').append(menuHTML);
    });
  } else showToast(false, (res && res.message) || 'Error while loading menu');
};

const mainLoader = (isStart) => {
  if (isStart) {
    $('#main-area').addClass('d-none');
    $('#main-loader').removeClass('d-none');
  } else {
    $('#main-area').removeClass('d-none');
    $('#main-loader').addClass('d-none');
  }
};

const fetchChannelList = async (isRefresh) => {
  if (!isRefresh) mainLoader(true);
  let res;
  if (!isRefresh) {
    res = await callAPI('GET', './apis/get-channel-list.php');
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
      if (roleId === 1 && resChannelTypes && resChannelTypes.data) {
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

      let channelStatsCount = {online: 0, disabled: 0};

      let finalArray = res.data.map((item) => {
        // Find and get disabled and uptime by comparing name field
        let foundSonicChannel = fluSonicList.find(
          (itemFluSonic) => itemFluSonic.name === item.name && itemFluSonic.url === item.flusonicUrl,
        );
        if (foundSonicChannel) {
          let blackoutFound = foundSonicChannel.config_on_disk.inputs.find((item) => item.url.includes('blackout/'));
          if (foundSonicChannel.disabled) channelStatsCount.disabled += 1;
          else channelStatsCount.online += 1;
          return {
            ...item,
            flusonicDisabled: foundSonicChannel.disabled,
            flusonicUptime: calculateUptime(foundSonicChannel.stats.opened_at),
            flusonicInputs: foundSonicChannel.config_on_disk.inputs,
            flusonicBlackoutFound: blackoutFound,
            flusonicBlackoutEnabled: blackoutFound && blackoutFound.priority === 10 ? false : true,
            // flusonicUrl: foundSonicChannel.url,
            flusonicUser: foundSonicChannel.user,
            flusonicPassword: foundSonicChannel.password,
          };
        } else {
          return {...item, flusonicNotFound: item.flusonicUrl ? true : false};
        }
      });
      channelList = finalArray;
      initTable(finalArray);
      initChannelForm();

      // Set channel stats
      $('#channels-stats #channels-online').html(`${channelStatsCount.online} channel${channelStatsCount.online > 1 ? 's' : ''} online`);
      $('#channels-stats #channels-disabled').html(
        `${channelStatsCount.disabled} channel${channelStatsCount.disabled > 1 ? 's' : ''} disabled`,
      );
      if ($('#channels-stats').hasClass('d-none')) $('#channels-stats').removeClass('d-none');

      // Setup refresh function
      if (!pageRefreshTimeout) {
        pageRefreshTimeout = setInterval(() => fetchChannelList(true), 5 * 60 * 1000);
      }
    }
  }
  mainLoader(false);
};

const showToast = (success, body) => {
  let notiElem = $('#notification');
  $('#notification .toast-body').text(body);
  if (notiElem.hasClass('bg-success')) {
    notiElem.removeClass('bg-success');
  }
  if (notiElem.hasClass('bg-danger')) {
    notiElem.removeClass('bg-danger');
  }
  notiElem.addClass(success ? 'bg-success' : 'bg-danger');
  let bsAlert = new bootstrap.Toast(notiElem, {autohide: success});
  bsAlert.show();
};

const readImageURL = (input) => {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      $('#edit-form #input_logo').attr('src', e.target.result);
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
  if (id) {
    selectedChannel = channelList.find((item) => id === parseFloat(item.id));
    Object.keys(selectedChannel).forEach((key) => {
      setChannelForm(selectedChannel, key);
    });
  } else {
    let emptyChannel = getEmptyChannel();
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
  if (action === 'blackout')
    confirmModalElm.html(
      `<div>Are you sure you want to <b class="fw-bold">${
        selectedConfirmItem.flusonicBlackoutEnabled ? 'disable' : 'enable'
      }</b> the ${action} for the following channel?</div><div><b class="fw-bold">${selectedConfirmItem.name} - ${
        selectedConfirmItem.channelName
      }</b></div>`,
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
          ...selectedConfirmItem.flusonicInputs.map((item) => {
            if (item.url.includes('blackout/')) body.blackoutEnabled = item.priority === 10 ? true : false;
            return {
              ...item,
              priority: item.url.includes('blackout/') ? (item.priority === 10 ? 0 : 10) : item.priority,
            };
          }),
        ],
      };
    }

    // Call API
    const res = await callAPI('POST', './apis/call_external_api.php', JSON.stringify(body));
    if (res && res.success) {
      showToast(true, res.message);
      $('#confirm-modal').modal('hide');
      fetchChannelList(true);
    } else {
      showToast(false, (res && res.message) || `Error while ${selectedConfirmAction}ing channel`);
    }
    toggleButtonLoader('#confirm-submit', false);
  } else {
    showToast(false, `Channel is not seleted for this action`);
  }
};

const toggleButtonLoader = (selector, isStart) => {
  var submitBtn = $(selector);
  submitBtn.prop('disabled', isStart);
  if (isStart) submitBtn.children('.loader').removeClass('d-none');
  else submitBtn.children('.loader').addClass('d-none');
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

    // Call API
    const res = await callAPI('POST', './apis/add-update-channel.php', JSON.stringify(body));
    if (res && res.success) {
      showToast(true, res.message);
      $('#edit-modal').modal('hide');
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

const logout = async () => {
  const res = await callAPI('GET', './apis/logout.php');
  if (res && res.success) {
    location.reload();
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

    // Form submit of add/edit channel
    $('#logout').on('click', (e) => {
      e.preventDefault();
      logout();
    });

    var x = document.getElementById('myTopnav');
    if (x.className === 'topnav') {
      x.className += ' responsive';
    } else {
      x.className = 'topnav';
    }

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
  }
});
