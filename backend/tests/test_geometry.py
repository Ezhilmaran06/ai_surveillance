from backend.app.ai.zones import point_in_polygon, segments_intersect, line_side

def test_point_in_polygon():
    square = [(0.0, 0.0), (10.0, 0.0), (10.0, 10.0), (0.0, 10.0)]

    # Point clearly inside
    assert point_in_polygon((5.0, 5.0), square) is True

    # Point clearly outside
    assert point_in_polygon((15.0, 5.0), square) is False
    assert point_in_polygon((-2.0, 5.0), square) is False
    assert point_in_polygon((5.0, 12.0), square) is False

def test_segments_intersect():
    # Perpendicular intersecting segments
    p1 = (0.0, 5.0)
    p2 = (10.0, 5.0)
    q1 = (5.0, 0.0)
    q2 = (5.0, 10.0)
    assert segments_intersect(p1, p2, q1, q2) is True

    # Parallel non-intersecting segments
    p3 = (0.0, 0.0)
    p4 = (10.0, 0.0)
    assert segments_intersect(p1, p2, p3, p4) is False

    # Disjoint segments
    r1 = (20.0, 20.0)
    r2 = (25.0, 25.0)
    assert segments_intersect(p1, p2, r1, r2) is False

def test_line_side_direction():
    # Horizontal tripwire from (0, 10) to (20, 10)
    A = (0.0, 10.0)
    B = (20.0, 10.0)

    # Point above line (smaller y in screen space, or positive/negative side)
    P_above = (10.0, 5.0)
    P_below = (10.0, 15.0)

    side_above = line_side(P_above, A, B)
    side_below = line_side(P_below, A, B)

    # Sides should have opposite signs
    assert (side_above > 0 and side_below < 0) or (side_above < 0 and side_below > 0)
