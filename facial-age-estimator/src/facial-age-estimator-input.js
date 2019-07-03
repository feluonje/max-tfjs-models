/* globals tf, Image */
import * as tf from '@tensorflow/tfjs-node'

const IMAGESIZE = 64

const computeTargetSize = function (width, height) {
  let resizeRatio = IMAGESIZE / Math.max(width, height)

  return {
    width: Math.round(resizeRatio * width),
    height: Math.round(resizeRatio * height)
  }
}

const getImageData = function (imageInput) {
  if (process.rollupBrowser) {
    return new Promise((resolve, reject) => {
      if (typeof imageInput === 'string') {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = err => reject(err)
        img.src = imageInput
      } else {
        resolve(imageInput)
      }
    })
  } else {
    return Promise.resolve(imageInput)
  }
}

const imageToTensor = function (imageData) {
  return tf.tidy(() => {
    const imgTensor = tf.browser.fromPixels(imageData)
    const targetSize = computeTargetSize(imgTensor.shape[0], imgTensor.shape[1])
    return imgTensor.resizeBilinear([targetSize.width, targetSize.height]).expandDims()
  })
}

/**
 * Convert image(s) to Tensor input required by the model
 *
 * @param {HTMLImageElement} imageInput - the image element
 */
const preprocess = function (imageInput) {
  let imageArray = [].concat(imageInput || [])

  return Promise.all(imageArray.map(getImageData))
    .then(canvases => canvases.map(imageToTensor))
    .then(tensorArray => tf.concat(tensorArray))
}

export { preprocess }
