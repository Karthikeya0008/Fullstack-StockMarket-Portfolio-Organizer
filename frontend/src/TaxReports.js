// src/TaxReports.js
import React, { useState } from "react";
import Layout from "./components/Layout";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";

export default function TaxReports() {
  const [formData, setFormData] = useState({
    name: "",
    pan: "",
    annualIncome: "",
    taxExemptions: "",
    otherIncome: "",
    assessmentYear: "",
    email: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateReport = async () => {
    const annualIncome = parseFloat(formData.annualIncome) || 0;
    const taxExemptions = parseFloat(formData.taxExemptions) || 0;
    const otherIncome = parseFloat(formData.otherIncome) || 0;

    const totalTaxableIncome = annualIncome + otherIncome - taxExemptions;

    // Tax slab logic
    let taxRate = 0;
    if (totalTaxableIncome > 3000000) taxRate = 0.30;
    else if (totalTaxableIncome > 1000000) taxRate = 0.20;
    else if (totalTaxableIncome > 500000) taxRate = 0.10;
    else taxRate = 0;

    const taxAmount = totalTaxableIncome * taxRate;
    const gstAmount = totalTaxableIncome > 3000000 ? totalTaxableIncome * 0.03 : 0; // Dummy GST 3% for high earners
    const totalDue = taxAmount + gstAmount;

    const report = {
      ...formData,
      totalTaxableIncome: totalTaxableIncome.toFixed(2),
      taxRate: (taxRate * 100).toFixed(0) + "%",
      taxAmount: taxAmount.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      totalDue: totalDue.toFixed(2),
      generationTime: new Date().toLocaleString("en-IN"),
    };

    generateWordReport(report);
  };

  const generateWordReport = (data) => {
    const fakeGST = "GSTIN: 29ABCDE1234F1Z5";
    const projectName = "FinWise Tax Computation Report 2025-26";

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 720, right: 720, bottom: 720, left: 720 },
            },
          },
          children: [
            // Title
            new Paragraph({
              children: [
                new TextRun({
                  text: projectName,
                  bold: true,
                  size: 36,
                  underline: "single",
                  color: "1E3A8A",
                }),
              ],
              alignment: "center",
              spacing: { after: 400 },
            }),

            // Info
            new Paragraph({
              children: [
                new TextRun({ text: fakeGST, bold: true }),
                new TextRun({
                  text: `\nGenerated on: ${data.generationTime}`,
                }),
              ],
              spacing: { after: 300 },
            }),

            // Personal Info
            new Paragraph({
              children: [new TextRun({ text: "Personal Information", bold: true, size: 28 })],
              spacing: { after: 200 },
            }),
            new Paragraph(`Name: ${data.name}`),
            new Paragraph(`PAN: ${data.pan}`),
            new Paragraph(`Email: ${data.email || "N/A"}`),
            new Paragraph(`Assessment Year: ${data.assessmentYear || "2024-25"}`),

            // Income Summary
            new Paragraph({
              children: [new TextRun({ text: "\nFinancial Computation Summary", bold: true, size: 28 })],
              spacing: { after: 200 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2 },
                bottom: { style: BorderStyle.SINGLE, size: 2 },
                left: { style: BorderStyle.SINGLE, size: 2 },
                right: { style: BorderStyle.SINGLE, size: 2 },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                insideVertical: { style: BorderStyle.SINGLE, size: 1 },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Particulars")], width: { size: 50, type: WidthType.PERCENTAGE } }),
                    new TableCell({ children: [new Paragraph("Amount (₹)")], width: { size: 50, type: WidthType.PERCENTAGE } }),
                  ],
                }),
                new TableRow({
                  children: [new TableCell({ children: [new Paragraph("Annual Income")] }), new TableCell({ children: [new Paragraph(data.annualIncome)] })],
                }),
                new TableRow({
                  children: [new TableCell({ children: [new Paragraph("Tax Exemptions")] }), new TableCell({ children: [new Paragraph(data.taxExemptions)] })],
                }),
                new TableRow({
                  children: [new TableCell({ children: [new Paragraph("Other Income")] }), new TableCell({ children: [new Paragraph(data.otherIncome)] })],
                }),
                new TableRow({
                  children: [new TableCell({ children: [new Paragraph("Total Taxable Income")] }), new TableCell({ children: [new Paragraph(`₹${data.totalTaxableIncome}`)] })],
                }),
                new TableRow({
                  children: [new TableCell({ children: [new Paragraph("Applicable Tax Rate")] }), new TableCell({ children: [new Paragraph(data.taxRate)] })],
                }),
                new TableRow({
                  children: [new TableCell({ children: [new Paragraph("Income Tax Amount")] }), new TableCell({ children: [new Paragraph(`₹${data.taxAmount}`)] })],
                }),
                new TableRow({
                  children: [new TableCell({ children: [new Paragraph("GST (if applicable)")] }), new TableCell({ children: [new Paragraph(`₹${data.gstAmount}`)] })],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: "Total Tax Payable", bold: true, color: "1D4ED8" })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: `₹${data.totalDue}`, bold: true, color: "1D4ED8" })],
                    }),
                  ],
                }),
              ],
            }),

            // Additional Notes
            new Paragraph({
              children: [
                new TextRun({
                  text: "\nNotes:",
                  bold: true,
                  size: 26,
                  underline: "single",
                }),
              ],
              spacing: { before: 300 },
            }),
            new Paragraph(
              "1. This report has been auto-generated by the FinWise Tax Computation Module based on the data provided by the user."
            ),
            new Paragraph(
              "2. The values are for simulation purposes and may differ from actual tax computation by Income Tax Department."
            ),
            new Paragraph("3. GST is only applicable if income exceeds ₹30,00,000."),
            new Paragraph("4. LTCG, rebates, and surcharges have been excluded from this demo report for simplicity."),

            // Official Verification
            new Paragraph({
              children: [
                new TextRun({
                  text: "\nOfficial Verification",
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph("Verified By: YieldWise Financial Automation Engine"),
            new Paragraph("Verification Code: YLD-" + Math.floor(Math.random() * 999999)),
            new Paragraph(`Timestamp: ${data.generationTime}`),

            // Signature & Footer
            new Paragraph({
              children: [
                new TextRun({
                  text: "\n\nSignature (System Generated): _________________________",
                }),
                new TextRun({
                  text: "\nAuthorized by: FinWise Automated System",
                  italics: true,
                }),
                new TextRun({
                  text: "\n\nThank you for trusting FinWise with your portfolio management.",
                  bold: true,
                }),
              ],
              spacing: { before: 400 },
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `YieldWise_Tax_Report_${data.name.replace(/\s+/g, "_")}.docx`);
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto mt-8 bg-white p-6 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Generate Tax Report
        </h1>

        <div className="space-y-3">
          {["name", "pan", "email", "assessmentYear", "annualIncome", "taxExemptions", "otherIncome"].map(
            (field) => (
              <input
                key={field}
                type={field.includes("Income") ? "number" : "text"}
                name={field}
                placeholder={
                  field === "name"
                    ? "Full Name as per PAN"
                    : field === "pan"
                    ? "PAN Number"
                    : field === "email"
                    ? "Email Address"
                    : field === "assessmentYear"
                    ? "Assessment Year (e.g. 2024-25)"
                    : field === "annualIncome"
                    ? "Annual Income (₹)"
                    : field === "taxExemptions"
                    ? "Tax Exemptions (₹)"
                    : "Other Income (₹)"
                }
                className="w-full p-2 rounded border text-gray-700"
                value={formData[field]}
                onChange={handleChange}
              />
            )
          )}
        </div>

        <button
          className="mt-6 px-4 py-2 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white rounded-lg hover:opacity-90 transition-all shadow-md"
          onClick={handleGenerateReport}
        >
          Generate & Download Report
        </button>
      </div>
    </Layout>
  );
}
