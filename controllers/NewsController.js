const fs = require('fs');

class NewsController {
    constructor(newsService, statService, config) {
        this.newsService = newsService;
        this.statService = statService;
        this.config = config; // Digunakan untuk passing config ke view (e.g. baseUrl)
    }


    async listPublic(req, res) {
        const { 
            page = 1,
            limit = 10,
            title = '',
            category = ''
        } = req.query;

        const currentPage = parseInt(page, 10);
        const perPage = parseInt(limit, 10);

        const offset = (currentPage - 1) * perPage;

        try {
            const { rows: posts, count: totalItems } = await this.newsService.getAllPosts({
                offset, 
                limit: perPage, 
                title, 
                category,
                status: "PUBLISHED"
            });

            const totalPages = Math.ceil(totalItems / perPage);

            res.status(200).json({
                success: true,
                data: posts,
                pagination: {
                    totalItems,
                    totalPages,
                    currentPage,
                    perPage,
                    hasNextPage: currentPage < totalPages,
                    hasPrevPage: currentPage > 1
                }
            });

            //render
            // res.render('admin/list', { posts, baseUrl: req.baseUrl });

        } catch (error) {
            //console.error('Error loading news list:', error);
            res.status(500).json({
                success: false,
                error: 'Error loading news list.',
                message: error.message
            });
        }
    }

    async getDetail(req, res) {
        try {
            const post = await this.newsService.getPostBySlug(req.params.slug);
            if (!post) {
                return res.status(404).json({
                    succses: false,
                    error: 'news tidak ditemukan'
                });
            }

            res.status(200).json({
                success: true,
                data: post
            })
            
            // Render detail view
            // res.render('detail', { post, baseUrl: req.baseUrl });
        } catch (error) {
            res.status(500).json({
                succses: false,
                error: 'gagal melihat news'
            });
        }
    }

    async getDetailForAdmin(req, res) {
        try {
            const post = await this.newsService.getPostBySlugForAdmin(req.params.slug);
            if (!post) {
                return res.status(404).json({
                    succses: false,
                    error: 'news tidak ditemukan'
                });
            }

            res.status(200).json({
                success: true,
                data: post
            })
            
            // Render detail view
            // res.render('detail', { post, baseUrl: req.baseUrl });
        } catch (error) {
            // res.status(500).send('Error loading post detail.');
            res.status(500).json({
                succses: false,
                error: 'gagal melihat news'
            });
        }
    }
    
    // Route Admin (CRUD)
    async adminList(req, res) {
        const { 
            page = 1,
            limit = 10,
            title = '',
            category = '',
            status = ''
        } = req.query;

        const currentPage = parseInt(page, 10);
        const perPage = parseInt(limit, 10);

        const offset = (currentPage - 1) * perPage;

        try {
            const { rows: posts, count: totalItems } = await this.newsService.getAllPosts({
                offset, 
                limit: perPage, 
                title, 
                category,
                status: status.toUpperCase()
            });

            const totalPages = Math.ceil(totalItems / perPage);

            res.status(200).json({
                success: true,
                data: posts,
                pagination: {
                    totalItems,
                    totalPages,
                    currentPage,
                    perPage,
                    hasNextPage: currentPage < totalPages,
                    hasPrevPage: currentPage > 1
                }
            });

            //render
            // res.render('admin/list', { posts, baseUrl: req.baseUrl });

        } catch (error) {
            //console.error('Error loading news list:', error);
            res.status(500).json({
                success: false,
                error: 'Error loading news list.',
                message: error.message
            });
        }
    }

    async createPost(req, res) {
        try {

            const { title, authorName, category, status, contentBlocks } = req.body;
            const files = req.files;

            const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''); 
            console.log("step 1 dilalui");
            const newNews = await this.newsService.createPost(
                { title, slug, category, authorName, status: status || 'DRAFT' },
                contentBlocks,
                files
            );

            res.status(201).json({
                success: true,
                data: newNews
            })

            // Redirect ke halaman daftar admin atau detail admin
            // res.redirect(this.config.adminRoutePrefix + '/'); 
        } catch (error) {
            console.error(error);

            if (req.files) {
                const allFiles = [
                    ...(req.files['thumbnailImage'] || []),
                    ...(req.files['contentImages'] || [])
                ];

                allFiles.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error(`Gagal menghapus file: ${file.path}`, err);
                        else console.log(`Berhasil menghapus sampah file: ${file.path}`);
                    });
                });
            }
            
            res.status(500).json({
                succses: false,
                error: 'gagal membuat news'
            });
        }
    }
    
    async updatePost(req, res) {
        try {
            const { id } = req.params;
            const { title, summary, authorId, status, contentBlocks } = req.body;
            
            if (!id || !title || !contentBlocks) {
                return res.status(400).json({ success: false, message: 'Missing required fields or ID.' });
            }

            const slug = title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, ''); 
            const isPublished = status === 'PUBLISHED';

            const updatedPost = await this.newsService.updatePost(
                id,
                { 
                    title, 
                    slug, 
                    summary, 
                    authorId, 
                    status: status || 'DRAFT',
                    publishedAt: isPublished ? new Date() : null 
                },
                contentBlocks
            );

            if (!updatedPost) {
                return res.status(404).json({ success: false, message: 'News post not found for update.' });
            }

            res.status(200).json({
                success: true,
                message: 'Post updated successfully.',
                data: updatedPost
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Failed to update post.', error: error.message });
        }
    }


    async deletePost(req, res) {
        try {
            const { id } = req.params;

            const result = await this.newsService.deletePost(id);

            if (result === 0) { // Sequelize destroy mengembalikan 0 jika tidak ada baris yang terpengaruh
                return res.status(404).json({ success: false, message: 'News post not found for deletion.' });
            }

            res.status(200).json({
                success: true,
                message: `Post with ID ${id} deleted successfully.`
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Failed to delete post.', error: error.message });
        }
    }

}

module.exports = NewsController;