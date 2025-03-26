document.addEventListener("DOMContentLoaded", function () {
  // Navigation
  const fullRadiografBtn = document.getElementById("full-radiograf-btn");
  const croppedRadiografBtn = document.getElementById("cropped-radiograf-btn");
  const fullRadiografPage = document.getElementById("full-radiograf-page");
  const croppedRadiografPage = document.getElementById(
    "cropped-radiograf-page"
  );

  fullRadiografBtn.addEventListener("click", function () {
    fullRadiografBtn.classList.add("active");
    croppedRadiografBtn.classList.remove("active");
    fullRadiografPage.classList.add("active");
    croppedRadiografPage.classList.remove("active");
  });

  croppedRadiografBtn.addEventListener("click", function () {
    croppedRadiografBtn.classList.add("active");
    fullRadiografBtn.classList.remove("active");
    croppedRadiografPage.classList.add("active");
    fullRadiografPage.classList.remove("active");
  });

  // Full Radiograf Upload Functionality
  setupUploadFunctionality(
    "full-upload-area",
    "full-file-input",
    "full-preview",
    "full-preview-container",
    "full-placeholder",
    "full-upload-btn",
    "full-reset-btn",
    "full-change-image",
    "full-status-message",
    "full-processing",
    "full-progress-bar",
    "full-results",
    "full-original",
    "full-segmented"
  );

  // Cropped Radiograf Upload Functionality
  setupUploadFunctionality(
    "cropped-upload-area",
    "cropped-file-input",
    "cropped-preview",
    "cropped-preview-container",
    "cropped-placeholder",
    "cropped-upload-btn",
    "cropped-reset-btn",
    "cropped-change-image",
    "cropped-status-message",
    "cropped-processing",
    "cropped-progress-bar",
    "cropped-results",
    "cropped-original",
    "cropped-segmented"
  );

  function setupUploadFunctionality(
    uploadAreaId,
    fileInputId,
    previewId,
    previewContainerId,
    placeholderId,
    uploadBtnId,
    resetBtnId,
    changeImageBtnId,
    statusMessageId,
    processingId,
    progressBarId,
    resultsId,
    originalImgId,
    segmentedImgId
  ) {
    const uploadArea = document.getElementById(uploadAreaId);
    const fileInput = document.getElementById(fileInputId);
    const preview = document.getElementById(previewId);
    const previewContainer = document.getElementById(previewContainerId);
    const placeholder = document.getElementById(placeholderId);
    const uploadBtn = document.getElementById(uploadBtnId);
    const resetBtn = document.getElementById(resetBtnId);
    const changeImageBtn = document.getElementById(changeImageBtnId);
    const statusMessage = document.getElementById(statusMessageId);
    const processing = document.getElementById(processingId);
    const progressBar = document.getElementById(progressBarId);
    const results = document.getElementById(resultsId);
    const originalImg = document.getElementById(originalImgId);
    const segmentedImg = document.getElementById(segmentedImgId);

    // Click on upload area to trigger file input
    uploadArea.addEventListener("click", function (e) {
      if (placeholder.style.display !== "none") {
        e.preventDefault();
        fileInput.click();
      }
    });

    // Change image button
    changeImageBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener("change", function () {
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!validTypes.includes(file.type)) {
          statusMessage.textContent =
            "Error: Hanya file JPG, JPEG, dan PNG yang diperbolehkan.";
          statusMessage.style.color = "#ef4444";
          return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          statusMessage.textContent = "Error: Ukuran file maksimal 5MB.";
          statusMessage.style.color = "#ef4444";
          return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
          // Show preview
          preview.src = e.target.result;
          previewContainer.style.display = "block";
          placeholder.style.display = "none";

          // Enable buttons
          uploadBtn.disabled = false;
          resetBtn.disabled = false;

          // Update status message
          statusMessage.textContent =
            'Gambar berhasil diunggah. Klik "Proses Gambar" untuk melanjutkan.';
          statusMessage.style.color = "#16a34a";

          // Hide results if they were shown
          results.style.display = "none";
          processing.style.display = "none";
        };

        reader.readAsDataURL(file);
      }
    });

    // Handle reset button click
    resetBtn.addEventListener("click", function () {
      // Clear file input
      fileInput.value = "";

      // Hide preview, show placeholder
      previewContainer.style.display = "none";
      placeholder.style.display = "block";

      // Disable buttons
      uploadBtn.disabled = true;
      resetBtn.disabled = true;

      // Clear status message
      statusMessage.textContent = "";

      // Hide results and processing
      results.style.display = "none";
      processing.style.display = "none";

      // Reset progress bar
      progressBar.style.width = "0%";

      // Reset upload button
      const buttonText = uploadBtn.querySelector(".button-text");
      const spinner = uploadBtn.querySelector(".spinner");
      buttonText.style.display = "inline";
      spinner.style.display = "none";
      uploadBtn.disabled = true;
    });

    // Handle upload button click
    uploadBtn.addEventListener("click", function () {
      if (preview.src) {
        // Show processing, hide results
        processing.style.display = "block";
        results.style.display = "none";

        // Update status message
        statusMessage.textContent = "Memproses gambar...";
        statusMessage.style.color = "#0369a1";

        // Disable upload button and show spinner
        uploadBtn.disabled = true;
        const buttonText = uploadBtn.querySelector(".button-text");
        const spinner = uploadBtn.querySelector(".spinner");
        buttonText.style.display = "none";
        spinner.style.display = "inline-block";

        // Reset progress bar
        progressBar.style.width = "0%";

        // Simulate API call with progress
        simulateAPICall(preview.src, progressBar, function (processedImageUrl) {
          // Hide processing, show results
          processing.style.display = "none";
          results.style.display = "block";

          // Set images in results
          originalImg.src = preview.src;
          segmentedImg.src = processedImageUrl; // In a real app, this would be the processed image

          // Update status message
          statusMessage.textContent =
            "Analisis selesai. Hasil deteksi ditampilkan di bawah.";
          statusMessage.style.color = "#16a34a";

          // Reset upload button
          buttonText.style.display = "inline";
          spinner.style.display = "none";
          uploadBtn.disabled = false;

          // Scroll to results
          results.scrollIntoView({ behavior: "smooth" });
        });
      }
    });
  }

  // Simulate API call with progress
  function simulateAPICall(imageUrl, progressBar, callback) {
    let progress = 0;
    const interval = setInterval(function () {
      progress += 5;
      progressBar.style.width = progress + "%";

      if (progress >= 100) {
        clearInterval(interval);

        // Simulate server processing delay
        setTimeout(function () {
          // In a real app, this would be the URL returned from the API
          // For demo, we're just using the same image
          callback(imageUrl);
        }, 500);
      }
    }, 100);
  }
});
