const { body, validationResult } = require('express-validator');

export const CreateNewsValidationRules = [
    body('title')
    .notEmpty().withMessage('title wajib diisi')
    .isLength({ min: 3 }).withMessage('title minimal 3 karakter')
    .trim(),
    body('authorName')
    .notEmpty().withMessage('authorName wajib diisi')
    .isLength({ min: 3 }).withMessage('authorName minimal 3 karakter')
    .trim(),
    body('category')
    .notEmpty().withMessage('category wajib diisi')
    .isLength({ min: 3 }).withMessage('category minimal 3 karakter')
    .trim(),
    body('status')
    .notEmpty().withMessage('status wajib dipilih antara DRAFT, PUBLISHED')
    .isLength({ min: 3 }).withMessage('status minimal 3 karakter')
    .trim()
    .custom((value) => {
        if (value != "DRAFT" || value != "PUBLISHED") {
            throw new Error('status tidak sesuai');
        }
        return true;
    }),

    body('contentBlocks')
        .isArray({ min: 1 }).withMessage('contentBlocks harus berupa array dan minimal berisi 1 block'),
    body('contentBlocks.*.blockType')
        .notEmpty().withMessage('blockType wajib diisi')
        .isIn(['PARAGRAPH', 'IMAGE', 'VIDEO', 'SUBHEADING']).withMessage('Tipe block tidak valid'),
    body('contentBlocks.*.contentValue')
        .custom((value, { req, path }) => {
            const index = path.match(/\d+/)[0];
            const blockType = req.body.contentBlocks[index].blockType;

            if (blockType !== 'IMAGE') {
                if (!value || value.trim() === '') {
                    throw new Error(`contentValue untuk ${blockType} wajib diisi`);
                }
            }

            if (( blockType === 'VIDEO') && !value.startsWith('http')) {
                throw new Error(`contentValue untuk ${blockType} harus berupa URL yang valid`);
            }
            return true;
        }),
    body('contentBlocks.*.caption')
        .optional({ nullable: true })
        .isString().withMessage('caption harus berupa string')
        .isLength({ max: 255 }).withMessage('caption maksimal 255 karakter')
]