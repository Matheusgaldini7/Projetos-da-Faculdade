function logger(req, res, next) {
  console.time('Requisição');
  console.log(`Método: ${req.method}; URL: ${req.url}`);

  res.on('finish', () => {
    console.log('Finalizou');
    console.timeEnd('Requisição');
  });

  next();
}

export default logger;
