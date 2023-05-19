<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>u-mee IPTV Management</title>

    <!-- styles start -->
    <link href="./assets/css/datatables.min.css" rel="stylesheet">
    </link>
    <link href="./assets/css/bootstrap.min.css" rel="stylesheet">
    </link>
    <link href="./assets/css/fontawesome/css/fontawesome.min.css" rel="stylesheet">
    <link href="./assets/css/fontawesome/css/brands.min.css" rel="stylesheet">
    <link href="./assets/css/fontawesome/css/solid.min.css" rel="stylesheet">
    <link href="./assets/css/style.css" rel="stylesheet">
    </link>
    <!-- styles end -->
</head>

<body>
    <div class="header">
        <img src="./assets/images/umee_smile_allwhite.png" class="umee-logo" alt="umee-logo">
        <nav>
            <ul>
                <li><a class="button" href="javascript:void(0)">Admin</a></li>
            </ul>
        </nav>
    </div>
    <div class="container-fluid">
        <div class="m-4">
            <!-- <div class="row mb-5">
                <div class="col">
                    <img src="./assets/images/umee.png" class="img-fluid" alt="umee-logo">
                </div>
                <div class="col d-flex justify-content-end align-items-center">
                    <a class="button" href="javascript:void(0)">Admin</a>
                </div>
            </div> -->
            <div class="row box">
                <div class="col">
                    <table class="table nowrap table-striped dt-responsive" id="tv-list" style="width:100%">
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- notification -->
    <div id="notification-container" class="position-fixed">
        <div id="notification" class="toast align-items-center text-white border-0" role="alert" aria-live="assertive"
            aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body"></div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"
                    aria-label="Close"></button>
            </div>
        </div>
    </div>

    <!-- Modal for channel edit -->
    <div id="edit-modal" class="modal fade">
        <div class="modal-dialog modal-dialog-centered" style="max-width: 745px;">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="staticBackdropLabel">Edit Channel</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form id="edit-form">
                    <div class="modal-body">
                        <div class="row mb-1">
                            <label for="input_logo" class="col-sm-2 col-form-label"></label>
                            <div class="col-sm-10">
                                <img id="input_logo" src="./assets/images/umee_smile_allwhite.png" class="channel-logo"
                                    alt="channel-logo">
                            </div>
                        </div>
                        <div class="row mb-1 d-none">
                            <label for="input_id" class="col-sm-2 col-form-label text-end">ID</label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control" id="input_id" readonly>
                            </div>
                        </div>
                        <div class="row mb-1 d-none">
                            <label for="input_name" class="col-sm-2 col-form-label text-end">Channel Number*</label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control" id="input_name" readonly>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_channelName" class="col-sm-2 col-form-label">Name*</label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control" id="input_channelName" required>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_typeSourceId" class="col-sm-2 col-form-label">Source</label>
                            <div class="col-sm-10">
                                <select id="input_typeSourceId" class="form-select" aria-label="Source">
                                </select>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_typeOTTId" class="col-sm-2 col-form-label">OTT</label>
                            <div class="col-sm-10">
                                <select id="input_typeOTTId" class="form-select" aria-label="OTT">
                                </select>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_ip" class="col-sm-2 col-form-label">IP</label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control" id="input_ip">
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_typePVIId" class="col-sm-2 col-form-label">PVI</label>
                            <div class="col-sm-10">
                                <div class="row">
                                    <div class="col-sm-5">
                                        <select id="input_typePVIId" class="form-select" aria-label="PVI">
                                        </select>
                                    </div>
                                    <div class="col-sm-7">
                                        <div class="row">
                                            <label for="input_pviPort" class="col-sm-3 col-form-label">Port</label>
                                            <div class="col-sm-9">
                                                <input type="text" class="form-control" id="input_pviPort">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_typePDUId" class="col-sm-2 col-form-label">PDU</label>
                            <div class="col-sm-10">
                                <div class="row">
                                    <div class="col-sm-5">
                                        <select id="input_typePDUId" class="form-select" aria-label="PDU">
                                        </select>
                                    </div>
                                    <div class="col-sm-7">
                                        <div class="row">
                                            <label for="input_pduPort" class="col-sm-3 col-form-label">Port</label>
                                            <div class="col-sm-9">
                                                <input type="text" class="form-control" id="input_pduPort">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_box" class="col-sm-2 col-form-label">Box</label>
                            <div class="col-sm-10">
                                <div class="row">
                                    <div class="col-sm-5">
                                        <input type="text" class="form-control" id="input_box">
                                    </div>
                                    <div class="col-sm-7">
                                        <div class="row">
                                            <label for="input_rack" class="col-sm-3 col-form-label">Rack</label>
                                            <div class="col-sm-9">
                                                <input type="text" class="form-control" id="input_rack">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_cardNumber" class="col-sm-2 col-form-label">Card Number</label>
                            <div class="col-sm-10">
                                <div class="row">
                                    <div class="col-sm-5">
                                        <input type="text" class="form-control" id="input_cardNumber">
                                    </div>
                                    <div class="col-sm-7">
                                        <div class="row">
                                            <label for="input_cardNumberExpiry"
                                                class="col-sm-3 col-form-label">Expiry</label>
                                            <div class="col-sm-9">
                                                <input type="text" class="form-control" id="input_cardNumberExpiry">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_typeEscalationId" class="col-sm-2 col-form-label">Escalation</label>
                            <div class="col-sm-10">
                                <select id="input_typeEscalationId" class="form-select" aria-label="Escalation">
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <label for="input_priority" class="col-sm-2 col-form-label">Priority</label>
                            <div class="col-sm-10">
                                <input type="checkbox" class="form-check-input" id="input_priority"
                                    style="padding: 0.32rem 0.4rem;">
                            </div>
                        </div>
                        <div class="row">
                            <label for="input_enabled" class="col-sm-2 col-form-label">Enabled</label>
                            <div class="col-sm-10">
                                <input type="checkbox" class="form-check-input" id="input_enabled"
                                    style="padding: 0.32rem 0.4rem;">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">Save</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- scripts start -->
    <script src="./assets/js/jquery-3.7.0.min.js"></script>
    <script src="./assets/js/jquery.validate.min.js"></script>
    <script src="./assets/js/bootstrap.bundle.min.js"></script>
    <script src="./assets/js/datatables.min.js"></script>
    <script src="./assets/js/moment.min.js"></script>
    <script src="./src/app.js"></script>
    <!-- scripts end -->
</body>

</html>