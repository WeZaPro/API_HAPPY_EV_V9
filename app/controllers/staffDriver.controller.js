const db = require("../models");
const StaffDriver = db.staffDriver;
const TaxiDriver = db.taxiDriver;
const axios = require("axios");
// require("dotenv").config();
const pool = require("../config/config.booking");

exports.create_staffDriver = async (req, res) => {
  try {
    const staffDriver_id = `ST-Driver-${String(Date.now()).slice(-6)}`;
    const { driver, phone, line_name, line_user_id } = req.body;

    const newStaffDriver = await StaffDriver.create({
      staffDriver_id,
      driver,
      phone,
      line_name,
      line_user_id,
    });

    res.status(201).send(newStaffDriver);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      // ดึง field ที่ซ้ำมาแสดง
      const field = err.errors[0].path;
      return res.status(400).send({
        message: `ข้อมูลซ้ำที่ ${field}`,
      });
    }
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

// exports.update_staffDriver = async (req, res) => {
//   console.log("update_staffDriver");
//   try {
//     const { staffDriver_id, driver, phone } = req.body;

//     if (!staffDriver_id) {
//       return res.status(400).send({ message: "กรุณาระบุ staffDriver_id" });
//     }

//     // ตรวจสอบว่ามี record อยู่จริงหรือไม่
//     const staffDriver = await StaffDriver.findOne({
//       where: { staffDriver_id },
//     });
//     if (!staffDriver) {
//       return res.status(404).send({ message: "ไม่พบข้อมูลพนักงานขับรถ" });
//     }

//     // อัปเดตข้อมูล
//     await staffDriver.update({
//       driver,
//       phone,
//     });

//     res.status(200).send({
//       message: "แก้ไขข้อมูลสำเร็จ",
//       data: staffDriver,
//     });
//   } catch (err) {
//     console.error("🔥 Sequelize error: ", err);
//     res.status(500).send({ message: err.message, error: err.errors });
//   }
// };

exports.update_staffDriver = async (req, res) => {
  console.log("update_staffDriver");
  try {
    const { staffDriver_id, driver, phone } = req.body;

    if (!staffDriver_id) {
      return res.status(400).send({ message: "กรุณาระบุ staffDriver_id" });
    }

    // 1) ตรวจสอบว่ามี staffDriver หรือไม่
    const staffDriver = await StaffDriver.findOne({
      where: { staffDriver_id },
    });
    if (!staffDriver) {
      return res.status(404).send({ message: "ไม่พบข้อมูลพนักงานขับรถ" });
    }

    // 2) อัปเดต staffDriver table
    await staffDriver.update({
      driver,
      phone,
    });

    // 3) อัปเดต taxiDriver table
    let taxiUpdateResult = null;
    if (staffDriver.line_user_id) {
      const taxiDriver = await TaxiDriver.findOne({
        where: { line_user_id: staffDriver.line_user_id },
      });

      if (taxiDriver) {
        await taxiDriver.update({
          driver,
          phone,
        });
        taxiUpdateResult = "อัปเดต taxiDriver สำเร็จ";
      } else {
        console.warn(
          `⚠ ไม่พบ taxiDriver ที่มี line_user_id = ${staffDriver.line_user_id}`
        );
        taxiUpdateResult = `ไม่พบ taxiDriver ที่มี line_user_id = ${staffDriver.line_user_id}`;
      }
    } else {
      console.warn("⚠ staffDriver ไม่มีค่า line_user_id");
      taxiUpdateResult = "staffDriver ไม่มีค่า line_user_id";
    }

    res.status(200).send({
      message: "แก้ไขข้อมูล staffDriver สำเร็จ",
      taxiUpdate: taxiUpdateResult,
      data: staffDriver,
    });
  } catch (err) {
    console.error("🔥 Sequelize error: ", err);
    res.status(500).send({ message: err.message, error: err.errors });
  }
};
