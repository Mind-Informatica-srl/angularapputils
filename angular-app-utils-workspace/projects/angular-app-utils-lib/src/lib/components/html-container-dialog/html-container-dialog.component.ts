import {
  Component,
  Inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

export interface HtmlContainerDialogData {
  htmlTitle: string;
  htmlBody: string;
  htmlOkButton: string;
  styleString: string;
  title?: string;
}

@Component({
  selector: "app-html-container-dialog",
  templateUrl: "./html-container-dialog.component.html",
  styleUrls: ["./html-container-dialog.component.scss"],
})
export class HtmlContainerDialogComponent implements AfterViewInit {
  printed: boolean = false;
  @ViewChild("bodyElement") bodyElement: ElementRef;
  @ViewChild("titleElement") titleElement: ElementRef;
  @ViewChild("headerContainer") headerContainer: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<HtmlContainerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HtmlContainerDialogData
  ) {
    dialogRef.disableClose = true;
  }

  ngAfterViewInit() {
    this.createStyle();
    this.createTitle();
    this.createBody();
  }

  createStyle(): void {
    const headerElement = document.createElement("head");
    //headerElement.appendChild(document.createTextNode(this.data.styleString));
    headerElement.innerHTML = this.data.styleString;
    this.bodyElement.nativeElement.appendChild(headerElement);
  }

  createTitle(): void {
    const content = document.createElement("div");
    content.innerHTML = this.data.htmlTitle;
    this.titleElement.nativeElement.appendChild(content);
  }

  createBody(): void {
    const content = document.createElement("div");
    content.innerHTML = this.data.htmlBody;
    this.bodyElement.nativeElement.appendChild(content);
  }

  print() {
    var divText = this.bodyElement.nativeElement.outerHTML;
    var myWindow = window.open("", "", "height=700,width=1000");
    var doc = myWindow.document;
    doc.open();
    doc.write("<html>");
    if (this.data.title != null && this.data.title != "") {
      doc.write("<head>");
      doc.write("<title>");
      doc.write(this.data.title);
      doc.write("</title>");
      doc.write("</head>");
    }
    doc.write(divText);
    doc.write("</html>");
    doc.close();

    myWindow.focus();
    setTimeout(function () {
      myWindow.print();
      myWindow.close();
    }, 500); //necessario  timeout, altrimenti viene pagina vuota
    this.printed = true;
    return true;
  }
}
