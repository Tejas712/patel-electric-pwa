import { electricalItems, type FieldType } from "./field";

export const billHtml = ({
  priceFields,
  wireFields,
}: {
  priceFields: FieldType[];
  wireFields: FieldType[];
}) => {
  //   const total = priceFields.reduce((t, f) => {
  //     return (t += Number(f.value));
  //   }, 0);

  const priceRows = priceFields.map(
    (f) =>
      `<tr class="item">
						<td>${f.label}</td>
						<td>${f.value}</td>
					</tr>`
  );
  const wireRows = wireFields.map(
    (f) =>
      `<tr class="item">
						<td>${f.label}</td>
						<td>${f.value}</td>
					</tr>`
  );
  const baseDetailsRows = electricalItems.map(
    (f) =>
      `<tr class="item">
						<td>${f.label}</td>
					</tr>`
  );

  return `<!DOCTYPE html>
  <html>
	  <head>
		  <meta charset="utf-8" />
		  <title>Patel Electric</title>
		  <style>
			  .invoice-box {
				  max-width: 800px;
				  margin: auto;
				  padding: 30px;
				  border: 1px solid #eee;
				  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
				  font-size: 16px;
				  line-height: 24px;
				  font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
				  color: #555;
			  }
  
			  .invoice-box table {
				  width: 100%;
				  line-height: inherit;
				  text-align: left;
			  }
  
			  .invoice-box table td {
				  padding: 5px;
				  vertical-align: top;
			  }
  
			  .invoice-box table tr td:nth-child(2) {
				  text-align: right;
			  }
  
			  .invoice-box table tr.top table td {
				  padding-bottom: 20px;
			  }
  
			  .invoice-box table tr.top table td.title {
				  font-size: 45px;
				  line-height: 45px;
				  color: #333;
				  text-align: center;
			  }
  
			  .invoice-box table tr.information table td {
				  padding-bottom: 40px;
			  }
  
			  .invoice-box table tr.heading td {
				  background: #eee;
				  border-bottom: 1px solid #ddd;
				  font-weight: bold;
			  }
  
			  .invoice-box table tr.details td {
				  padding-bottom: 20px;
			  }
  
			  .invoice-box table tr.item td {
				  border-bottom: 1px solid #eee;
			  }
  
			  .invoice-box table tr.item.last td {
				  border-bottom: none;
			  }
  
			  .invoice-box table tr.total td:nth-child(2) {
				  border-top: 2px solid #eee;
				  font-weight: bold;
			  }
  
			  @media only screen and (max-width: 600px) {
				  .invoice-box table tr.top table td {
					  width: 100%;
					  display: block;
					  text-align: center;
				  }
  
				  .invoice-box table tr.information table td {
					  width: 100%;
					  display: block;
					  text-align: center;
				  }
			  }
  
			  /** RTL **/
			  .invoice-box.rtl {
				  direction: rtl;
				  font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
			  }
  
			  .invoice-box.rtl table {
				  text-align: right;
			  }
  
			  .invoice-box.rtl table tr td:nth-child(2) {
				  text-align: left;
			  }
			  .details {
				  text-align: center;
			  }
		  </style>
	  </head>
  
	  <body>
		  <div class="invoice-box">
			  <p style="text-align: center;">।। શ્રી સ્વામિનારારાય ।। </p>
<p style="text-align: right">Himatbhai Faldu</p>
			  <p style="text-align: right">Mobile No. : 9879337870 </p>
			  <table cellpadding="0" cellspacing="0">
				  <tr class="top">
					  <td colspan="2">
						  <table>
							  <tr>
								  <td class="title">
									  <h3 style="color: #967D6B;margin:0px">Patel Electric</h3>
								  </td>
							  </tr>
						  </table>
					  </td>
				  </tr>
				  <tr class="heading">
				  <td colspan="2" class="details">Details</td>
			  </tr>
			  ${baseDetailsRows.join("")}

			  <tr class="item">
				  <td></td>
			  </tr>

			  <tr class="heading">
				  <td>Item</td>
  
				  <td></td>
			  </tr>
			  ${wireRows.join("")}
			  <tr class="item">
				  <td></td>
			  </tr>
				  <tr class="heading">
					  <td>Item</td>
					  <td>Price</td>
				  </tr>
				  ${priceRows.join("")}
			  </table>
		  </div>
	  </body>
  </html>`;
};
