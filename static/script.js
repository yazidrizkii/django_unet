document.addEventListener("DOMContentLoaded", () => {
  // Navigation
  const fullRadiografBtn = document.getElementById("full-radiograf-btn")
  const croppedRadiografBtn = document.getElementById("cropped-radiograf-btn")
  const fullRadiografPage = document.getElementById("full-radiograf-page")
  const croppedRadiografPage = document.getElementById("cropped-radiograf-page")

  fullRadiografBtn.addEventListener("click", () => {
    fullRadiografBtn.classList.add("active")
    croppedRadiografBtn.classList.remove("active")
    fullRadiografPage.classList.add("active")
    croppedRadiografPage.classList.remove("active")
  })

  croppedRadiografBtn.addEventListener("click", () => {
    croppedRadiografBtn.classList.add("active")
    fullRadiografBtn.classList.remove("active")
    croppedRadiografPage.classList.add("active")
    fullRadiografPage.classList.remove("active")
  })

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
    "full-segmented",
    "full-confidence",
    "full-impaction-area",
    "full-detection-text",
    "full-analysis-text",
    "full",
  )

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
    "cropped-segmented",
    "cropped-confidence",
    "cropped-impaction-area",
    "cropped-detection-text",
    "cropped-analysis-text",
    "crop",
  )

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
    segmentedImgId,
    confidenceId,
    impactionAreaId,
    detectionTextId,
    analysisTextId,
    predictionType,
  ) {
    const uploadArea = document.getElementById(uploadAreaId)
    const fileInput = document.getElementById(fileInputId)
    const preview = document.getElementById(previewId)
    const previewContainer = document.getElementById(previewContainerId)
    const placeholder = document.getElementById(placeholderId)
    const uploadBtn = document.getElementById(uploadBtnId)
    const resetBtn = document.getElementById(resetBtnId)
    const changeImageBtn = document.getElementById(changeImageBtnId)
    const statusMessage = document.getElementById(statusMessageId)
    const processing = document.getElementById(processingId)
    const progressBar = document.getElementById(progressBarId)
    const results = document.getElementById(resultsId)
    const originalImg = document.getElementById(originalImgId)
    const segmentedImg = document.getElementById(segmentedImgId)
    const confidenceEl = document.getElementById(confidenceId)
    const impactionAreaEl = document.getElementById(impactionAreaId)
    const detectionTextEl = document.getElementById(detectionTextId)
    const analysisTextEl = document.getElementById(analysisTextId)

    // Click on upload area to trigger file input
    uploadArea.addEventListener("click", (e) => {
      if (placeholder.style.display !== "none") {
        e.preventDefault()
        fileInput.click()
      }
    })

    // Change image button
    changeImageBtn.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      fileInput.click()
    })

    // Handle file selection
    fileInput.addEventListener("change", () => {
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0]

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/jpg"]
        if (!validTypes.includes(file.type)) {
          statusMessage.textContent = "Error: Hanya file JPG, JPEG, dan PNG yang diperbolehkan."
          statusMessage.style.color = "#ef4444"
          return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          statusMessage.textContent = "Error: Ukuran file maksimal 5MB."
          statusMessage.style.color = "#ef4444"
          return
        }

        const reader = new FileReader()

        reader.onload = (e) => {
          // Show preview
          preview.src = e.target.result
          previewContainer.style.display = "block"
          placeholder.style.display = "none"

          // Enable buttons
          uploadBtn.disabled = false
          resetBtn.disabled = false

          // Update status message
          statusMessage.textContent = 'Gambar berhasil diunggah. Klik "Proses Gambar" untuk melanjutkan.'
          statusMessage.style.color = "#16a34a"

          // Hide results if they were shown
          results.style.display = "none"
          processing.style.display = "none"
        }

        reader.readAsDataURL(file)
      }
    })

    // Handle reset button click
    resetBtn.addEventListener("click", () => {
      // Clear file input
      fileInput.value = ""

      // Hide preview, show placeholder
      previewContainer.style.display = "none"
      placeholder.style.display = "block"

      // Disable buttons
      uploadBtn.disabled = true
      resetBtn.disabled = true

      // Clear status message
      statusMessage.textContent = ""

      // Hide results and processing
      results.style.display = "none"
      processing.style.display = "none"

      // Reset progress bar
      progressBar.style.width = "0%"

      // Reset upload button
      const buttonText = uploadBtn.querySelector(".button-text")
      const spinner = uploadBtn.querySelector(".spinner")
      buttonText.style.display = "inline"
      spinner.style.display = "none"
      uploadBtn.disabled = true
    })

    // Handle upload button click
    uploadBtn.addEventListener("click", () => {
      if (fileInput.files && fileInput.files[0]) {
        // Show processing, hide results
        processing.style.display = "block"
        results.style.display = "none"

        // Update status message
        statusMessage.textContent = "Memproses gambar..."
        statusMessage.style.color = "#0369a1"

        // Disable upload button and show spinner
        uploadBtn.disabled = true
        const buttonText = uploadBtn.querySelector(".button-text")
        const spinner = uploadBtn.querySelector(".spinner")
        buttonText.style.display = "none"
        spinner.style.display = "inline-block"

        // Prepare FormData
        const formData = new FormData()
        formData.append("image", fileInput.files[0])
        formData.append("prediction_type", predictionType)
        formData.append("csrfmiddlewaretoken", document.querySelector("[name=csrfmiddlewaretoken]").value)

        let progress = 0
        const progressInterval = setInterval(() => {
          progress += 10
          progressBar.style.width = `${progress}%`
          if (progress >= 90) clearInterval(progressInterval)
        }, 200)

        fetch(uploadUrl, {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            clearInterval(progressInterval)
            progressBar.style.width = "100%"

            if (data.success) {
              // Hide processing, show results
              processing.style.display = "none"
              results.style.display = "block"

              // Set images in results
              originalImg.src = data.original_image_url
              segmentedImg.src = data.annotated_image_url

              // Update metrics
              confidenceEl.textContent = `${data.confidence}%`
              impactionAreaEl.textContent = `${data.impaction_percentage}%`

              // Update detection text
              if (data.has_impaction) {
                detectionTextEl.textContent = `Terdeteksi: Gigi impaksi dengan area ${data.impaction_percentage.toFixed(1)}%`
                detectionTextEl.style.color = "#ef4444"
              } else {
                detectionTextEl.textContent = "Tidak terdeteksi impaksi gigi"
                detectionTextEl.style.color = "#16a34a"
              }

              // Update analysis text
              let analysisText = ""
              if (data.has_impaction) {
                if (data.confidence > 80) {
                  analysisText = `Terdeteksi impaksi gigi dengan tingkat kepercayaan tinggi (${data.confidence}%). Area impaksi mencakup ${data.impaction_percentage.toFixed(1)}% dari gambar. Disarankan untuk melakukan konsultasi dengan dokter gigi spesialis bedah mulut untuk evaluasi lebih lanjut.`
                } else if (data.confidence > 60) {
                  analysisText = `Terdeteksi kemungkinan impaksi gigi dengan tingkat kepercayaan sedang (${data.confidence}%). Diperlukan pemeriksaan lebih lanjut untuk konfirmasi diagnosis.`
                } else {
                  analysisText = `Terdeteksi kemungkinan impaksi gigi dengan tingkat kepercayaan rendah (${data.confidence}%). Hasil ini memerlukan verifikasi dari tenaga medis profesional.`
                }
              } else {
                analysisText = `Tidak terdeteksi adanya impaksi gigi pada gambar radiograf ini. Tingkat kepercayaan sistem: ${data.confidence}%.`
              }
              analysisTextEl.textContent = analysisText

              // Update status message
              statusMessage.textContent = "Analisis selesai. Hasil deteksi ditampilkan di bawah."
              statusMessage.style.color = "#16a34a"

              // Reset upload button
              buttonText.style.display = "inline"
              spinner.style.display = "none"
              uploadBtn.disabled = false

              // Scroll to results
              results.scrollIntoView({ behavior: "smooth" })
            } else {
              // Handle error
              statusMessage.textContent = "Error: " + data.error
              statusMessage.style.color = "#ef4444"
              processing.style.display = "none"
              buttonText.style.display = "inline"
              spinner.style.display = "none"
              uploadBtn.disabled = false
            }
          })
          .catch((error) => {
            clearInterval(progressInterval)
            statusMessage.textContent = "Error: Terjadi kesalahan saat memproses gambar."
            statusMessage.style.color = "#ef4444"
            processing.style.display = "none"
            buttonText.style.display = "inline"
            spinner.style.display = "none"
            uploadBtn.disabled = false
            console.error("Error:", error)
          })
      }
    })
  }
})
