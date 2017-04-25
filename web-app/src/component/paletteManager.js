var React = require("react");
var Swatch = require("./swatch");
import AppDispatcher from "../data/dispatcher.js";
import PaletteEmmiter from "../data/emmiter";
import PaletteStore from "../data/store";

class PaletteManager extends React.Component {
	constructor(props) {
		super(props);
		//Get info from the URL

		this.state = {
			bgColor: "rgba(0,0,0,0)",
			elapsed: 0,
			firstMount: true,
			palette: [],
			selectedColor: ""
		};

		PaletteEmmiter.on("canvasMouseMove", this.onCanvasMouseMove.bind(this));
		PaletteEmmiter.on(
			"canvasMouseClick",
			this.onCanvasMouseClick.bind(this)
		);
		PaletteEmmiter.on("resetPalette", () => {
			this.setState({ palette: PaletteStore.palette });
		});
		PaletteEmmiter.on("paletteGenerate", () => {
			this.setState({ palette: PaletteStore.palette });
		});

		// Listen for which color to relocate
		PaletteEmmiter.on("selectedColor", () => {
			this.setState({ selectedColor: PaletteStore.selectedColor });
		});

		PaletteEmmiter.on("switchedSwatches", () => {
			this.setState({
				palette: PaletteStore.palette,
				selectedColor: PaletteStore.selectedColor
			});
		});
	}

	addSwatch(color) {
		if (!/^#[0-9a-f]{3,6}$/i.test(color))
			throw new Error("Invalid color for addSwatch");

		AppDispatcher.dispatch({
			actionName: "addSwatch",
			color: color
		});

		this.setState({ palette: PaletteStore.palette });
	}

	removeSwatch(key) {
		if (PaletteStore.palette[key] === undefined)
			throw new Error("Key doesn't exist in palette");

		AppDispatcher.dispatch({
			actionName: "removeSwatch",
			key: key
		});

		this.setState({ palette: PaletteStore.palette });
	}

	componentWillMount() {
		if (this.state.firstMount) {
			var urlColors = document.location.hash.split(",");
			if (urlColors[0] !== "")
				for (var id in urlColors)
					this.addSwatch(urlColors[id]);
			this.setState({ firstMount: false });
		}

		// generate random test colors
		if (this.props.debug && PaletteStore.palette.length < 1)
			while (
				PaletteStore.palette.length < Math.floor(Math.random() * 3 + 4)
			)
				this.addSwatch(
					"#" + ((Math.random() * 0xffffff) << 0).toString(16)
				);

		this.setState({ palette: PaletteStore.palette });
	}

	componentToHex(c) {
		var hex = c.toString(16);
		return hex.length === 1 ? "0" + hex : hex;
	}

	RGBToHex(r, g, b) {
		return (
			"#" +
			this.componentToHex(r) +
			this.componentToHex(g) +
			this.componentToHex(b)
		);
	}

	onCanvasMouseClick() {
		var color = this.RGBToHex(
			PaletteStore.clickColor[0],
			PaletteStore.clickColor[1],
			PaletteStore.clickColor[2]
		);

		this.addSwatch(color);
	}

	onCanvasMouseMove() {
		this.setState({
			bgColor: "rgba(" + PaletteStore.mouseColor.join(",") + ")"
		});
	}

	selectColor(color) {
		AppDispatcher.dispatch({
			actionName: "selectColor",
			color: color
		});
	}

	// This function manages the drag and drop updating of a swatch.
	//  When a swatch is dropped this function should be fired with that
	//  swatch's id and the new location that it should be moved to.
	switchSwatches(color) {
		AppDispatcher.dispatch({
			actionName: "switchSwatches",
			color: color
		});
	}

	getPaletteLength() {
		return PaletteStore.palette.length();
	}

	getPaletteAsString() {
		return Object.keys(PaletteStore.palette)
			.map(function(id) {
				return PaletteStore.palette[id];
			})
			.join(",");
	}

	getPaletteInfo() {
		return PaletteStore.palette;
	}

	render() {
		document.location.hash = this.getPaletteAsString();

		var bgColor = "rgba(" + PaletteStore.mouseColor.join(",") + ")";

		return (
			<div style={{ backgroundColor: bgColor }} id="palette">
				{Object.keys(this.state.palette).map(
					function(key) {
						return (
							<Swatch
								className="swatch"
								deleteFunc={this.removeSwatch.bind(this, key)}
								id={key}
								key={key}
								color={this.state.palette[key]}
								selectedColor={this.state.selectedColor}
								selectColor={this.selectColor}
								switchSwatches={this.switchSwatches}
							/>
						);
					}.bind(this)
				)}
			</div>
		);
	}
}

module.exports = PaletteManager;
