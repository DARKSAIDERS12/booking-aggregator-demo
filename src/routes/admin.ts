import { Router } from "express";
import { AdminController } from "../controllers/adminController";
import multer from "multer";

const router = Router();
const adminController = new AdminController();

// Настройка multer для загрузки файлов
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || 
        file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.mimetype === "application/vnd.ms-excel") {
      cb(null, true);
    } else {
      cb(new Error("Поддерживаются только CSV и Excel файлы"));
    }
  }
});

// GET /stations - просмотр всех таблиц станций
router.get("/stations", (req, res) => adminController.getAllStations(req, res));

// POST /stations/upload - загрузка файла со станциями
router.post("/stations/upload", upload.single("file"), (req, res) => adminController.uploadStations(req, res));

// POST /stations/load-from-apis - загрузка станций из внешних API
router.post("/stations/load-from-apis", (req, res) => adminController.loadStationsFromApis(req, res));

// POST /stations/auto-map - автоматическое сопоставление станций
router.post("/stations/auto-map", (req, res) => adminController.autoMapStations(req, res));

// POST /stations/mappings - ручное сопоставление станций
router.post("/stations/mappings", (req, res) => adminController.createStationMapping(req, res));

// POST /stations/groups - создание группы станций
router.post("/stations/groups", (req, res) => adminController.createStationGroup(req, res));

// GET /stations/mappings - получение сопоставлений станций
router.get("/stations/mappings", (req, res) => adminController.getMappedStations(req, res));

export { router as adminRoutes };
