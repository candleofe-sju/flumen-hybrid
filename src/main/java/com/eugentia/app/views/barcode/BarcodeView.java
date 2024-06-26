package com.eugentia.app.views.barcode;

import com.eugentia.app.components.BarcodeComponent;
import com.eugentia.app.data.entity.BarcodeType;
import com.eugentia.app.data.repository.BarcodeTypeRepository;
import com.vaadin.flow.component.combobox.ComboBox;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.data.value.ValueChangeMode;
import com.vaadin.flow.router.Menu;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.Nullable;
import jakarta.annotation.security.RolesAllowed;
import org.springframework.beans.factory.annotation.Autowired;
import uk.org.okapibarcode.backend.*;
import uk.org.okapibarcode.graphics.Color;
import uk.org.okapibarcode.output.SvgRenderer;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@PageTitle("Barcode")
@Menu(icon = "line-awesome/svg/credit-card.svg", order = 17)
@Route(value = "barcode")
@RolesAllowed("USER")
public class BarcodeView extends VerticalLayout {
    private final BarcodeComponent barcode;

    private final ComboBox<BarcodeType> barcodeType;

    private final TextField textField;

    public BarcodeView(@Autowired BarcodeTypeRepository repository) {
        HorizontalLayout horizontalLayout = new HorizontalLayout();

        barcodeType = new ComboBox<>("Type");
        var barcodeTypes = repository.findAll();
        barcodeType.setItems(barcodeTypes);
        barcodeType.setItemLabelGenerator(BarcodeType::getType);

        var currentBarcodeType = repository.findBarcodeTypeByType("Code128");
        barcodeType.setValue(currentBarcodeType);

        textField = new TextField("Text");
        textField.setWidth("300px");
        textField.setValueChangeMode(ValueChangeMode.EAGER);
        barcode = new BarcodeComponent();

        // class 'styled-svg' overrides stroke and fill, see showsvg.css
        barcode.addClassName("styled-svg");

        barcodeType.addValueChangeListener(event -> getSvgContent());
        textField.addValueChangeListener(event -> getSvgContent());

        horizontalLayout.add(barcodeType, textField);
        add(horizontalLayout, barcode);
    }

    private void getSvgContent() {
        if (!textField.getValue().isEmpty()) barcode.setContent(generateBarcode());
    }

    @Nullable
    private String generateBarcode() {
        String type = barcodeType.getValue().getType();

        if (type.isBlank()) {
            return null;
        }

        Symbol barcode = null;
        switch (type) {
            case "AustraliaPost":
                barcode = new AustraliaPost();
                break;
            case "AztecCode":
                barcode = new AztecCode();
                break;
            case "AztecRune":
                barcode = new AztecRune();
                break;
            case "ChannelCode":
                barcode = new ChannelCode();
                break;
            case "Codabar":
                barcode = new Codabar();
                break;
            case "CodablockF":
                barcode = new CodablockF();
                break;
            case "Code2Of5":
                barcode = new Code2Of5();
                break;
            case "Code3Of9":
                barcode = new Code3Of9();
                break;
            case "Code3Of9Extended":
                barcode = new Code3Of9Extended();
                break;
            case "Code11":
                barcode = new Code11();
                break;
            case "Code16k":
                barcode = new Code16k();
                break;
            case "Code32":
                barcode = new Code32();
                break;
            case "Code49":
                barcode = new Code49();
                break;
            case "Code93":
                barcode = new Code93();
                break;
            case "Code128":
                barcode = new Code128();
                break;
            case "CodeOne":
                barcode = new CodeOne();
                break;
            case "Composite":
                barcode = new Composite();
                break;
            case "DataBar14":
                barcode = new DataBar14();
                break;
            case "DataBarExpanded":
                barcode = new DataBarExpanded();
                break;
            case "DataBarLimited":
                barcode = new DataBarLimited();
                break;
            case "DataMatrix":
                barcode = new DataMatrix();
                break;
            case "Ean":
                barcode = new Ean();
                break;
            case "EanUpcAddOn":
                barcode = new EanUpcAddOn();
                break;
            case "GridMatrix":
                barcode = new GridMatrix();
                break;
            case "JapanPost":
                barcode = new JapanPost();
                break;
            case "KixCode":
                barcode = new KixCode();
                break;
            case "KoreaPost":
                barcode = new KoreaPost();
                break;
            case "Logmars":
                barcode = new Logmars();
                break;
            case "MaxiCode":
                barcode = new MaxiCode();
                break;
            case "MicroQrCode":
                barcode = new MicroQrCode();
                break;
            case "MsiPlessey":
                barcode = new MsiPlessey();
                break;
            case "Nve18":
                barcode = new Nve18();
                break;
            case "Pdf417":
                barcode = new Pdf417();
                break;
            case "Pharmacode":
                barcode = new Pharmacode();
                break;
            case "Pharmacode2Track":
                barcode = new Pharmacode2Track();
                break;
            case "Pharmazentralnummer":
                barcode = new Pharmazentralnummer();
                break;
            case "Plessey":
                barcode = new Plessey();
                break;
            case "Postnet":
                barcode = new Postnet();
                break;
            case "QrCode":
                barcode = new QrCode();
                break;
            case "RoyalMail4State":
                barcode = new RoyalMail4State();
                break;
            case "Telepen":
                barcode = new Telepen();
                break;
            case "Upc":
                barcode = new Upc();
                break;
            case "UspsOneCode":
                barcode = new UspsOneCode();
                break;
            case "UspsPackage":
                barcode = new UspsPackage();
                break;
            default:
                break;
        }

        if (barcode != null) {
            barcode.setQuietZoneHorizontal(5);
            barcode.setQuietZoneVertical(5);
            barcode.setFontName("Arial");
            barcode.setFontSize(14);
            barcode.setContent(textField.getValue());

            ByteArrayOutputStream stream = new ByteArrayOutputStream();
            SvgRenderer renderer = new SvgRenderer(stream, 1.0, Color.WHITE, Color.BLACK, true);

            try {
                renderer.render(barcode);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }

            return stream.toString();
        }

        return null;
    }
}
