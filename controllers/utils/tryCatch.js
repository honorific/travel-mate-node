const tryCatch = (controller) => {
  console.log('controller is: ', controller)
  return async (req, res) => {
    try {
      await controller(req, res)
    } catch (error) {
      console.log(error)
      res.status(500).json({
        success: false,
        message: 'Something went wrong. Please try again later',
      })
    }
  }
}

export default tryCatch
