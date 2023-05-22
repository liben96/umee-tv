/// <reference path="../assets/js/jquery-3.7.0.min.js" />

let channelList = [],
  formValidator,
  selectedChannel,
  dataTable,
  typesLists;
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
        if (type === 'GET') resolve({success: true, data: res});
        else {
          if (res && res.success !== undefined) resolve({...res});
          else resolve({success: false, message: res});
        }
      })
      .catch((e) => {
        resolve({success: false, data: e});
      });
  });

const initTable = (data) => {
  if (dataTable) {
    // Table is already initialised just update the data
    dataTable.fnClearTable();
    dataTable.fnAddData(data);
  } else {
    dataTable = $('#tv-list').dataTable({
      data,
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
          render: (data, type, row) => `<div><div> ${row.typePDU}</div>${row.pduPort ? `<div><u>Port</u>: ${row.pduPort}</div>` : ''}<div>`,
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
        {data: 'typeEscalation', title: 'Escalation', className: 'text-center align-middle', width: '62px'},
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
          title: 'Status',
          className: 'text-center align-middle all',
          render: (data, type, row) =>
            row.flusonicDisabled !== undefined
              ? `<div class="text-center"><div class="${
                  !row.flusonicDisabled ? 'text-success' : 'text-secondary'
                }"><i class="fa-solid fa-circle"></i> ${row.flusonicDisabled ? 'Disabled' : 'Online'}</div>${
                  row.flusonicUptime ? `<div class="text-secondary text-right" style="font-size:0.8rem">${row.flusonicUptime}</div>` : ''
                }<div>`
              : '',
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
                ? `<a class="me-2" href="javascript:void(0)" data-bs-toggle="popover" data-bs-trigger="hover focus" data-bs-content="${
                    row.flusonicBlackoutEnabled ? 'Disable' : 'Enable'
                  } blackout"><i class="fa-solid fa-tv"></i></a>`
                : ''
            }
            ${
              !row.disabled
                ? `<a class="me-2" href="javascript:void(0)" data-bs-toggle="popover" data-bs-trigger="hover focus" data-bs-content="Restart"><i class="fa-solid fa-arrows-rotate"></i></a>`
                : ''
            }
            <a href="javascript:void(0)" onclick="toggleEditModal(${
              row.id
            })" data-bs-toggle="popover" data-bs-trigger="hover focus" data-bs-content="Edit"><i class="fa-solid fa-pen"></i></a>
            <div>`,
        },
      ],
      order: [[2, 'asc']],
      pageLength: 10,
    });
  }
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
  const popoverList = [...popoverTriggerList].map((popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl));
};

const calculateUptime = (startDate) => {
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - startDate;

  // Calculate days, hours, and minutes
  const millisecondsPerMinute = 1000 * 60;
  const millisecondsPerHour = millisecondsPerMinute * 60;
  const millisecondsPerDay = millisecondsPerHour * 24;

  const days = Math.floor(timeDifference / millisecondsPerDay);
  const hours = Math.floor((timeDifference % millisecondsPerDay) / millisecondsPerHour);
  const minutes = Math.floor((timeDifference % millisecondsPerHour) / millisecondsPerMinute);

  // Construct the uptime string
  let uptimeString = '';
  if (days > 0) {
    uptimeString += days + 'd';
  }
  if (hours > 0) {
    uptimeString += ' ' + hours + 'h';
  }
  // if (minutes > 0) {
  //   uptimeString += ' ' + minutes + 'm';
  // }

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
    $(`#edit-form #input_${inputKey}`).append($('<option></option>').attr('value', '').text('Select an option'));
    typesLists[key].forEach((item) => {
      $(`#edit-form #input_${inputKey}`).append($('<option></option>').attr('value', item.id).text(item.description));
    });
  });
};

const fetchChannelList = async () => {
  const res = await callAPI('GET', './apis/get-channel-list.php');
  if (res.success) {
    let resChannelTypes;
    // Only load types first time no need load again on next refresh
    if (!typesLists) {
      // Get channel types arrays
      resChannelTypes = await callAPI('GET', './apis/get-channel-types.php');
    }
    if (typesLists || (resChannelTypes && resChannelTypes.success)) {
      if (!typesLists) typesLists = resChannelTypes.data;
      // Get data from flusonic
      const resFluSonic = await callAPI('GET', './apis/flusonic_response.json');
      if (resFluSonic.success) {
        let finalArray = res.data.map((item) => {
          // Find and get disabled and uptime by comparing name field
          let foundSonicChannel = resFluSonic.data.streams.find((itemFluSonic) => itemFluSonic.name === item.name);
          if (foundSonicChannel) {
            let blackoutFound = foundSonicChannel.config_on_disk.inputs.find((item) => item.url.includes('blackout/'));
            return {
              ...item,
              flusonicDisabled: foundSonicChannel.disabled,
              flusonicUptime: calculateUptime(foundSonicChannel.stats.opened_at),
              flusonicInputs: foundSonicChannel.config_on_disk.inputs,
              flusonicBlackoutFound: blackoutFound,
              flusonicBlackoutEnabled: blackoutFound && blackoutFound.priority === 10 ? true : false,
            };
          } else return item;
        });
        channelList = finalArray;
        initTable(finalArray);
        initChannelForm();
      }
    }
  }
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

const toggleEditModal = (id) => {
  toggleEditFormLoader(false);
  if (id) {
    selectedChannel = channelList.find((item) => id === parseFloat(item.id));
    Object.keys(selectedChannel).forEach((key) => {
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
      } else if (key === 'logo') {
        // Setting all text inputs
        $(`#edit-form #input_${key}`).attr('src', `./assets/images/logos/${selectedChannel[key]}`);
      } else {
        // Setting all text inputs
        $(`#edit-form #input_${key}`).val(selectedChannel[key]);
      }
      // Setting other inputs menually
    });
  }
  formValidator.resetForm();
  const myModalAlternative = new bootstrap.Modal('#edit-modal', {keyboard: false});
  myModalAlternative.toggle();
};

const toggleEditFormLoader = (isStart) => {
  var submitBtn = $('#channel-submit-button');
  submitBtn.prop('disabled', isStart);
  if (isStart) submitBtn.children('.loader').removeClass('d-none');
  else submitBtn.children('.loader').addClass('d-none');
};

const submitEditForm = async () => {
  toggleEditFormLoader(true);
  let body = {
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
  };

  //Getting new values from form
  Object.keys(body).forEach((key) => {
    if (key === 'enabled' || key === 'priority') {
      body[key] = $(`#edit-form #input_${key}`).is(':checked') ? 1 : 0;
    } else if (key === 'id') {
      body[key] = parseFloat($(`#edit-form #input_${key}`).val());
    } else {
      body[key] = $(`#edit-form #input_${key}`).val();
    }
  });

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

  if (body.id && body.name) {
    // Call API
    // const res = await callAPI('POST', './apis/add-update-channel.php', JSON.stringify(body));
    if (res && res.success) {
      showToast(true, res.message);
      $('#edit-modal').modal('hide');
      fetchChannelList();
    } else {
      showToast(false, (res && res.message) || 'Error while updating channel');
    }
  }
  toggleEditFormLoader(false);
};

$(() => {
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
});
