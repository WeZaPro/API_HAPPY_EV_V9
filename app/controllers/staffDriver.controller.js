const db = require("../models");
const StaffDriver = db.staffDriver;
const axios = require("axios");
// require("dotenv").config();
const pool = require("../config/config.booking");

exports.create_staffDriver = async (req, res) => {
  try {
    const staffDriver_id = `ST-Driver-${String(Date.now()).slice(-6)}`;
    const { driver, phone, line_name, line_user_id } = req.body;

    // 🔍 ตรวจสอบว่า phone หรือ line_user_id ซ้ำหรือไม่
    const existingDriver = await StaffDriver.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ phone }, { line_user_id }],
      },
    });

    if (existingDriver) {
      let duplicateField =
        existingDriver.phone === phone ? "เบอร์โทร" : "LINE User ID";
      return res.status(400).send({
        message: `บัญชีนี้ลงทะเบียนแล้ว (${duplicateField} ซ้ำ)`,
      });
    }

    // ✅ ถ้ายังไม่มีให้สร้างใหม่
    const newStaffDriver = await StaffDriver.create({
      staffDriver_id,
      driver,
      phone,
      line_name,
      line_user_id,
    });

    res.status(201).send(newStaffDriver);
  } catch (err) {
    console.error("🔥 Sequelize error: ", err);
    res.status(500).send({ message: err.message, error: err.errors });
  }
};
exports.getAllStaffDrivers = async (req, res) => {
  try {
    const staffDrivers = await StaffDriver.findAll({
      order: [["createdAt", "DESC"]], // เรียงล่าสุดก่อน (ถ้ามี field createdAt)
    });
    res.status(200).send(staffDrivers);
  } catch (err) {
    console.error("🔥 Sequelize error: ", err);
    res.status(500).send({ message: err.message, error: err.errors });
  }
};

// controller.js

// controller.js

exports.update_staffDriver = async (req, res) => {
  try {
    const { staffDriver_id, driver, phone } = req.body;

    if (!staffDriver_id) {
      return res.status(400).send({ message: "กรุณาระบุ staffDriver_id" });
    }

    // ตรวจสอบว่ามี record อยู่จริงหรือไม่
    const staffDriver = await StaffDriver.findOne({
      where: { staffDriver_id },
    });
    if (!staffDriver) {
      return res.status(404).send({ message: "ไม่พบข้อมูลพนักงานขับรถ" });
    }

    // ตรวจสอบว่า phone หรือ line_user_id ซ้ำกับคนอื่นหรือไม่
    // if (phone || line_user_id) {
    //   const duplicate = await StaffDriver.findOne({
    //     where: {
    //       [db.Sequelize.Op.or]: [{ phone }, { line_user_id }],
    //       staffDriver_id: { [db.Sequelize.Op.ne]: staffDriver_id }, // ยกเว้น record ปัจจุบัน
    //     },
    //   });

    //   if (duplicate) {
    //     let duplicateField =
    //       duplicate.phone === phone ? "เบอร์โทร" : "LINE User ID";
    //     return res.status(400).send({
    //       message: `ไม่สามารถแก้ไขได้ (${duplicateField} ซ้ำกับคนอื่น)`,
    //     });
    //   }
    // }

    // อัปเดตข้อมูล
    await staffDriver.update({
      driver,
      phone,
    });

    res.status(200).send({
      message: "แก้ไขข้อมูลสำเร็จ",
      data: staffDriver,
    });
  } catch (err) {
    console.error("🔥 Sequelize error: ", err);
    res.status(500).send({ message: err.message, error: err.errors });
  }
};
