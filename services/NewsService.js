const { Op } = require("sequelize");

class NewsService {
    constructor(NewsModel, ContentNewsModel) {
        this.News = NewsModel;
        this.ContentNews = ContentNewsModel;
    }

    async getAllPosts({ offset = 0, limit = 10, title = '', category = '', status = '' }) {
        const validStatuses = ['PUBLISHED', 'ARCHIVED', 'DRAFT'];
        const where = {};

        if (status && validStatuses.includes(status)) {
            where.status = status;
        }
        if (title) {
            where.title = { [Op.like]: `%${title}%` }; 
        }
        if (category) {
            where.category = category;
        }
        
        return await this.News.findAndCountAll({
            where: where,
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });
    }

    async getPostBySlug(slug) {
        return this.News.findOne({
            where: { slug, status: 'PUBLISHED' },
            include: [{
                model: this.ContentNews,
                as: 'blocks',
                order: [['order', 'ASC']]
            }]
        });
    }

    async getPostBySlugForAdmin(slug) {
        return this.News.findOne({
            where: { slug },
            include: [{
                model: this.ContentNews,
                as: 'blocks',
                order: [['order', 'ASC']]
            }]
        });
    }

    async createPost(newsData, contentBlocks, files) {
        return this.News.sequelize.transaction(async (t) => {
            // console.log("step 2 dilalui");
            const rawPath = files['thumbnailImage']?.[0]?.path;
            newsData.imagePath = rawPath ? rawPath.replace(/\\/g, '/') : null;
            const newsItem = await this.News.create(newsData, { transaction: t });

            // console.log("step 3 dilalui");

            let blocks = [];
            let count = 0;
            contentBlocks.forEach((element, index) => {
                console.log(element);
                if (element.blockType == "IMAGE") {
                    const rawPathE = files['contentImages']?.[count]?.path;
                    element.contentValue = rawPathE ? rawPathE.replace(/\\/g, '/') : null;
                    count++;
                }
                element.newsId = newsItem.id;
                element.order = index + 1;
                blocks.push(element);
            });

            // console.log("step 4 dilalui");

            await this.ContentNews.bulkCreate(blocks, { transaction: t });
            return newsItem;
        });
    }

    async updatePost(id, newsData, contentBlocks, files) {
        return this.News.sequelize.transaction(async (t) => {
            console.log("step 0 selesai");

            const oldNews = await this.News.findByPk(id, {
                include: [{ model: this.ContentNews, as: 'contentBlocks' }],
                transaction: t
            });

            console.log("step 1 selesai");
            
            if (!oldNews) throw new Error("Berita tidak ditemukan");

            let filesToDelete = [];

            if (files['thumbnailImage']?.[0]) {
                if (oldNews.imagePath) filesToDelete.push(oldNews.imagePath);
                const rawPath = files['thumbnailImage'][0].path;
                newsData.imagePath = rawPath.replace(/\\/g, '/');
            } else {
                newsData.imagePath = oldNews.imagePath;
            }

            console.log("step 2 selesai");

            await oldNews.update(newsData, { transaction: t });

            console.log("step 3 selesai");

            const oldBlocks = oldNews.contentBlocks || [];
            
            await this.ContentNews.destroy({
                where: { newsId: id },
                transaction: t
            });

            console.log("step 4 selesai");

            let blocks = [];
            let imageCount = 0;

            console.log("step 5 selesai");

            contentBlocks.forEach((element, index) => {
                if (element.blockType === "IMAGE") {
                    const newFile = files['contentImages']?.[imageCount];
                    
                    if (newFile) {
                        const rawPathE = newFile.path;
                        element.contentValue = rawPathE.replace(/\\/g, '/');
                        imageCount++;
                    } else {
                        element.contentValue = element.contentValue; 
                    }
                }
                
                element.newsId = id;
                element.order = index + 1;
                blocks.push(element);
            });

            await this.ContentNews.bulkCreate(blocks, { transaction: t });

            return { newsItem: oldNews, filesToDelete };
        });
    }

    async updateStatusNews(id, status) {
        const news = await this.News.findByPk(id);
        if (!news) throw new Error("Berita tidak ditemukan");

        await news.update({ 
            status: status 
        });

        return news;
    }

    async deletePost(id) {
        return this.News.destroy({ where: { id } });
    }
}

module.exports = NewsService;