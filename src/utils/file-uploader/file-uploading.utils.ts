export const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
};

export const editFileName = (req, file, callback) => {
    const name = req.query.filename
        ? req.query.filename.replaceAll(' ', '-')
        : file.originalname.replaceAll(' ', '-');

    const filename = req.query.filename
        ? name
        : name.substring(0, name.lastIndexOf('.'));

    const fileExtName = file.originalname.substring(
        file.originalname.lastIndexOf('.') + 1,
        file.originalname.length
    );

    const randomName = Array(8)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
    callback(null, `${filename}-${randomName}.${fileExtName}`);
};
